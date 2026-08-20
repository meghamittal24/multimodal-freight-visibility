import { dataStore } from '../db/dataStore';
import { mlClient } from './mlClient.service';
import { LegData, ShipmentData } from '../db/seedData';

export interface IngestPingInput {
  shipmentId: string;
  source: 'FOIS' | 'FASTAG' | 'PCS1X' | 'ICEGATE' | 'VAHAN' | 'IOT_TELEMETRY';
  eventName: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  temperatureCelsius?: number;
  delayDeltaMinutes?: number;
  rawPayload?: Record<string, any>;
}

export class TrackingEngineService {
  public static async processIncomingPing(ping: IngestPingInput): Promise<{
    event: any;
    shipment: ShipmentData;
    updatedLeg?: LegData;
    predictionTriggered?: any;
  }> {
    const shipment = dataStore.getShipmentById(ping.shipmentId);
    if (!shipment) {
      throw new Error(`Shipment with ID ${ping.shipmentId} not found`);
    }

    // Find the currently active or in-progress leg
    let activeLeg = shipment.legs.find((l) => l.status === 'IN_PROGRESS');
    if (!activeLeg) {
      activeLeg = shipment.legs.find((l) => l.status === 'PLANNED');
      if (activeLeg) {
        activeLeg.status = 'IN_PROGRESS';
        activeLeg.actualStart = new Date().toISOString();
      }
    }

    if (activeLeg) {
      if (ping.latitude) activeLeg.currentLat = ping.latitude;
      if (ping.longitude) activeLeg.currentLng = ping.longitude;
      if (ping.temperatureCelsius !== undefined) activeLeg.temperatureReadingCelsius = ping.temperatureCelsius;
      if (ping.delayDeltaMinutes) {
        activeLeg.delayMinutes += ping.delayDeltaMinutes;
        shipment.cumulativeDelayMinutes += ping.delayDeltaMinutes;
        if (activeLeg.delayMinutes > 30) {
          activeLeg.status = 'DELAYED';
          shipment.status = 'DELAYED';
        }
      }
      activeLeg.lastTelemetryPing = new Date().toISOString();
      dataStore.updateLeg(shipment.id, activeLeg.id, activeLeg);
    }

    // Record tracking event
    const event = dataStore.addTrackingEvent({
      shipmentId: shipment.id,
      legId: activeLeg?.id,
      source: ping.source,
      eventName: ping.eventName,
      locationName: ping.locationName,
      latitude: ping.latitude,
      longitude: ping.longitude,
      rawPayload: ping.rawPayload || {},
    });

    // Proactively recalculate ML delay prediction for the active leg or next handoff
    let prediction = null;
    if (activeLeg) {
      prediction = await mlClient.predictDelayRisk({
        mode: activeLeg.mode,
        corridor: shipment.corridorId,
        commodity: shipment.commodityType,
        is_perishable: shipment.isPerishable ? 1 : 0,
        toll_congestion_index: ping.source === 'FASTAG' ? 0.75 : 0.2,
        rake_turnaround_hrs: ping.source === 'FOIS' ? 4.5 : 2.0,
        port_berth_queue_length: ping.source === 'PCS1X' ? 5 : 1,
      });

      activeLeg.prediction = prediction;
      dataStore.updateLeg(shipment.id, activeLeg.id, { prediction });

      if (prediction.riskLabel === 'HIGH' || prediction.riskLabel === 'CRITICAL') {
        dataStore.alerts.unshift({
          id: `alt-${Date.now()}`,
          shipmentId: shipment.id,
          predictionId: prediction.id,
          alertType: 'PROACTIVE_DELAY_RISK',
          severity: prediction.riskLabel,
          title: `Cascading Delay Alert: ${activeLeg.fromNode} -> ${activeLeg.toNode}`,
          message: prediction.plainLanguageReason,
          recommendedAction: prediction.suggestedAction,
          acknowledged: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    dataStore.updateShipment(shipment.id, shipment);

    return {
      event,
      shipment,
      updatedLeg: activeLeg,
      predictionTriggered: prediction,
    };
  }
}
