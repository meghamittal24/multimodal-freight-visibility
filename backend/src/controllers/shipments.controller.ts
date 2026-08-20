import { Request, Response } from 'express';
import { dataStore } from '../db/dataStore';
import { RippleEffectService } from '../services/rippleEffect.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ShipmentsController {
  public static listShipments(req: AuthenticatedRequest, res: Response) {
    const { corridorId, mode, status } = req.query;
    let shipments = dataStore.getAllShipments({
      corridorId: corridorId as string,
      mode: mode as string,
      status: status as string,
    });

    // Role-based filtering: Shippers only see their consignments if corridor is restricted
    if (req.user && req.user.role === 'SHIPPER' && !req.user.corridorAccess.includes('ALL')) {
      shipments = shipments.filter((s) => req.user?.corridorAccess.includes(s.corridorId));
    }

    return res.json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  }

  public static getShipmentById(req: Request, res: Response) {
    const { id } = req.params;
    const shipment = dataStore.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment ${id} not found` });
    }
    return res.json({ success: true, data: shipment });
  }

  public static createShipment(req: Request, res: Response) {
    const body = req.body;
    const newId = `shp-${Date.now()}`;
    const newTracking = body.trackingNumber || `SIH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newShipment = {
      id: newId,
      trackingNumber: newTracking,
      consignmentTitle: body.consignmentTitle || 'Multimodal Cargo Dispatch',
      commodityType: body.commodityType || 'Industrial Goods',
      isPerishable: Boolean(body.isPerishable),
      targetTemperatureCelsius: body.targetTemperatureCelsius,
      shipperId: body.shipperId || 'usr-001',
      corridorId: body.corridorId || 'cor-001',
      origin: body.origin || 'Ludhiana ICD',
      destination: body.destination || 'Mundra Port',
      currentMode: body.currentMode || 'ROAD',
      status: 'IN_TRANSIT' as const,
      cargoWeightTons: Number(body.cargoWeightTons || 20.0),
      containerNumber: body.containerNumber || `CONT-${Math.floor(100000 + Math.random() * 900000)}`,
      totalPlannedHours: Number(body.totalPlannedHours || 36.0),
      cumulativeDelayMinutes: 0,
      carbonEstimateKg: 450.0,
      legs: body.legs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.shipments.set(newId, newShipment);
    return res.status(201).json({ success: true, data: newShipment });
  }

  public static getShipmentTimeline(req: Request, res: Response) {
    const { id } = req.params;
    const shipment = dataStore.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment ${id} not found` });
    }

    const timeline = shipment.legs.map((leg) => ({
      legId: leg.id,
      sequenceOrder: leg.sequenceOrder,
      mode: leg.mode,
      fromNode: leg.fromNode,
      toNode: leg.toNode,
      plannedStart: leg.plannedStart,
      plannedEnd: leg.plannedEnd,
      actualStart: leg.actualStart,
      actualEnd: leg.actualEnd,
      delayMinutes: leg.delayMinutes,
      status: leg.status,
      source: leg.source,
      assetId: leg.assetId,
      prediction: leg.prediction,
      currentTelemetry: {
        lat: leg.currentLat,
        lng: leg.currentLng,
        temperatureCelsius: leg.temperatureReadingCelsius,
        lastPing: leg.lastTelemetryPing,
      },
    }));

    return res.json({
      success: true,
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      cumulativeDelayMinutes: shipment.cumulativeDelayMinutes,
      timeline,
    });
  }

  public static getRippleEffect(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const graph = RippleEffectService.calculateRippleEffect(id);
      return res.json({ success: true, data: graph });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }
}
