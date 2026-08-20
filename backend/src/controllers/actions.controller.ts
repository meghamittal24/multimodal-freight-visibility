import { Request, Response } from 'express';
import { dataStore } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ActionsController {
  public static executeAction(req: AuthenticatedRequest, res: Response) {
    const { shipmentId, legId, actionType, notes } = req.body;

    if (!shipmentId || !actionType) {
      return res.status(400).json({ success: false, message: 'shipmentId and actionType are required' });
    }

    const shipment = dataStore.getShipmentById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment ${shipmentId} not found` });
    }

    let leg = legId ? dataStore.getLeg(shipmentId, legId) : shipment.legs.find((l) => l.status === 'IN_PROGRESS' || l.status === 'PLANNED');

    // Mutate state according to action
    let actionSummary = '';

    if (actionType === 'HOLD') {
      shipment.status = 'HELD';
      if (leg) {
        leg.status = 'HELD';
        if (leg.prediction) leg.prediction.actionExecuted = true;
      }
      actionSummary = `Consignment #${shipment.trackingNumber} placed on HOLD at upstream hub. Open-yard demurrage avoided.`;
    } else if (actionType === 'REROUTE') {
      shipment.status = 'REROUTED';
      shipment.currentMode = 'RAIL';
      if (leg) {
        leg.mode = 'RAIL';
        leg.status = 'IN_PROGRESS';
        leg.fromNode = `${leg.fromNode} (Rerouted via WDFC Rail Siding)`;
        if (leg.prediction) leg.prediction.actionExecuted = true;
      }
      actionSummary = `Consignment #${shipment.trackingNumber} successfully REROUTED via Western Dedicated Freight Corridor (WDFC).`;
    } else if (actionType === 'RESCHEDULE') {
      if (leg) {
        leg.delayMinutes = Math.max(0, leg.delayMinutes - 60);
        if (leg.prediction) leg.prediction.actionExecuted = true;
      }
      actionSummary = `Downstream vessel slot / customs gate-in for #${shipment.trackingNumber} successfully RESCHEDULED.`;
    } else {
      actionSummary = `Status updated to PROCEED for shipment #${shipment.trackingNumber}.`;
    }

    dataStore.updateShipment(shipment.id, shipment);

    // Add coordination event
    dataStore.addTrackingEvent({
      shipmentId: shipment.id,
      legId: leg?.id,
      source: 'MOCK',
      eventName: `COORDINATION_ACTION_${actionType}`,
      locationName: leg?.fromNode || shipment.origin,
      rawPayload: {
        actionType,
        triggeredBy: req.user?.name || 'System Operator',
        notes: notes || 'Executed from Unified Visibility Action Panel',
      },
    });

    return res.json({
      success: true,
      message: actionSummary,
      actionType,
      shipment,
      executedAt: new Date().toISOString(),
    });
  }
}
