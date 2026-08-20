import { Request, Response } from 'express';
import { dataStore } from '../db/dataStore';
import { mlClient } from '../services/mlClient.service';

export class PredictionsController {
  public static async triggerPredictionForShipment(req: Request, res: Response) {
    const { id } = req.params;
    const shipment = dataStore.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment ${id} not found` });
    }

    // Find target leg: active or next planned leg
    let targetLeg = shipment.legs.find((l) => l.status === 'IN_PROGRESS') ||
                    shipment.legs.find((l) => l.status === 'PLANNED') ||
                    shipment.legs[0];

    const inputData = {
      mode: req.body.mode || targetLeg.mode,
      corridor: shipment.corridorId,
      from_node: targetLeg.fromNode,
      to_node: targetLeg.toNode,
      commodity: shipment.commodityType,
      is_perishable: shipment.isPerishable ? 1 : 0,
      planned_duration_hrs: req.body.planned_duration_hrs || 14.0,
      toll_congestion_index: req.body.toll_congestion_index || (targetLeg.mode === 'ROAD' ? 0.65 : 0.1),
      rake_turnaround_hrs: req.body.rake_turnaround_hrs || (targetLeg.mode === 'RAIL' ? 4.0 : 2.0),
      port_berth_queue_length: req.body.port_berth_queue_length || (targetLeg.mode === 'PORT' ? 5 : 1),
      weather: req.body.weather || 'CLEAR',
    };

    const prediction = await mlClient.predictDelayRisk(inputData);
    prediction.legId = targetLeg.id;

    targetLeg.prediction = prediction;
    dataStore.updateLeg(shipment.id, targetLeg.id, { prediction });

    if (prediction.riskLabel === 'HIGH' || prediction.riskLabel === 'CRITICAL') {
      dataStore.alerts.unshift({
        id: `alt-${Date.now()}`,
        shipmentId: shipment.id,
        predictionId: prediction.id,
        alertType: 'PREDICTIVE_DISRUPTION',
        severity: prediction.riskLabel,
        title: `Predicted Delay on Leg ${targetLeg.sequenceOrder} (${targetLeg.mode})`,
        message: prediction.plainLanguageReason,
        recommendedAction: prediction.suggestedAction,
        acknowledged: false,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      shipmentId: shipment.id,
      legId: targetLeg.id,
      prediction,
    });
  }

  public static getLegPrediction(req: Request, res: Response) {
    const { legId } = req.params;
    for (const shipment of dataStore.shipments.values()) {
      const leg = shipment.legs.find((l) => l.id === legId);
      if (leg && leg.prediction) {
        return res.json({ success: true, legId, prediction: leg.prediction });
      }
    }
    return res.status(404).json({ success: false, message: `No prediction found for leg ${legId}` });
  }
}
