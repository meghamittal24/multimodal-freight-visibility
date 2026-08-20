import { Request, Response } from 'express';
import { TrackingEngineService } from '../services/trackingEngine.service';
import { dataStore } from '../db/dataStore';

export class TrackingController {
  public static async pushTrackingPing(req: Request, res: Response) {
    try {
      const {
        shipmentId,
        source,
        eventName,
        locationName,
        latitude,
        longitude,
        temperatureCelsius,
        delayDeltaMinutes,
        rawPayload,
      } = req.body;

      if (!shipmentId || !source || !eventName || !locationName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: shipmentId, source, eventName, locationName',
        });
      }

      const result = await TrackingEngineService.processIncomingPing({
        shipmentId,
        source,
        eventName,
        locationName,
        latitude,
        longitude,
        temperatureCelsius,
        delayDeltaMinutes,
        rawPayload,
      });

      return res.status(201).json({
        success: true,
        message: 'Telemetry ping ingested and state updated',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static getShipmentEvents(req: Request, res: Response) {
    const { shipmentId } = req.params;
    const events = dataStore.trackingEvents.filter((e) => e.shipmentId === shipmentId);
    return res.json({ success: true, count: events.length, data: events });
  }

  public static getAlerts(req: Request, res: Response) {
    return res.json({ success: true, data: dataStore.getAlerts() });
  }

  public static acknowledgeAlert(req: Request, res: Response) {
    const { alertId } = req.params;
    const ok = dataStore.acknowledgeAlert(alertId);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.json({ success: true, message: 'Alert acknowledged' });
  }
}
