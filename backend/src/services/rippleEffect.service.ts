import { dataStore } from '../db/dataStore';

export interface RippleNode {
  id: string;
  label: string;
  type: 'SHIPMENT' | 'LEG' | 'ASSET' | 'DOWNSTREAM_VESSEL' | 'CUSTOMS';
  mode?: string;
  status: string;
  delayMinutes: number;
  cascadingImpactCostInr: number;
  riskScore: number;
}

export interface RippleEdge {
  from: string;
  to: string;
  relation: string;
  propagationFactor: number;
}

export interface RippleEffectGraph {
  shipmentId: string;
  primaryDelayCause: string;
  totalDownstreamDelayMinutes: number;
  totalEstimatedLossInr: number;
  nodes: RippleNode[];
  edges: RippleEdge[];
  mitigationRecommendation: string;
}

export class RippleEffectService {
  public static calculateRippleEffect(shipmentId: string): RippleEffectGraph {
    const shipment = dataStore.getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`);
    }

    const nodes: RippleNode[] = [];
    const edges: RippleEdge[] = [];
    let totalDownstreamDelay = 0;
    let totalLoss = 0;

    // Node for root shipment
    nodes.push({
      id: shipment.id,
      label: `${shipment.trackingNumber} (${shipment.consignmentTitle})`,
      type: 'SHIPMENT',
      status: shipment.status,
      delayMinutes: shipment.cumulativeDelayMinutes,
      cascadingImpactCostInr: 0,
      riskScore: 0.85,
    });

    let prevLegNodeId = shipment.id;

    shipment.legs.forEach((leg, idx) => {
      const legNodeId = `node-${leg.id}`;
      const legDelay = leg.delayMinutes || (leg.prediction?.expectedDelayMinutes || 0);
      const isDelayed = legDelay > 0;
      
      // Calculate financial loss exposure (demurrage, perishability, truck idling)
      let legLoss = 0;
      if (leg.mode === 'PORT') {
        legLoss = (legDelay / 60) * 4500; // Rs 4,500/hr port container demurrage
      } else if (leg.mode === 'RAIL') {
        legLoss = (legDelay / 60) * 2200; // Rake siding detention charge
      } else if (leg.mode === 'ROAD') {
        legLoss = (legDelay / 60) * 1200; // Truck idling / driver overtime
      }

      if (shipment.isPerishable && legDelay > 120) {
        legLoss += 65000; // Fruit quality downgrade penalty
      }

      totalDownstreamDelay += legDelay;
      totalLoss += legLoss;

      nodes.push({
        id: legNodeId,
        label: `Leg ${leg.sequenceOrder}: ${leg.mode} (${leg.fromNode.split('/')[0]} → ${leg.toNode.split(' ')[0]})`,
        type: 'LEG',
        mode: leg.mode,
        status: leg.status,
        delayMinutes: legDelay,
        cascadingImpactCostInr: Math.round(legLoss),
        riskScore: leg.prediction?.riskScore || (isDelayed ? 0.8 : 0.1),
      });

      edges.push({
        from: prevLegNodeId,
        to: legNodeId,
        relation: idx === 0 ? 'COMMENCES' : 'HANDOFF_TO',
        propagationFactor: leg.mode === 'PORT' ? 1.4 : 1.0,
      });

      prevLegNodeId = legNodeId;
    });

    // Downstream vessel node
    const vesselNodeId = `node-vessel-${shipment.id}`;
    nodes.push({
      id: vesselNodeId,
      label: 'Connecting Ocean Carrier (MV Ocean Giant - Berth 2)',
      type: 'DOWNSTREAM_VESSEL',
      mode: 'VESSEL',
      status: 'SLOT_AT_RISK',
      delayMinutes: Math.round(totalDownstreamDelay * 0.8),
      cascadingImpactCostInr: 85000,
      riskScore: 0.92,
    });

    edges.push({
      from: prevLegNodeId,
      to: vesselNodeId,
      relation: 'CASCADES_TO_SLOT_MISS',
      propagationFactor: 1.8,
    });

    return {
      shipmentId: shipment.id,
      primaryDelayCause: 'Port Vessel Berthing Backlog & Railyard Congestion',
      totalDownstreamDelayMinutes: totalDownstreamDelay,
      totalEstimatedLossInr: Math.round(totalLoss + 85000),
      nodes,
      edges,
      mitigationRecommendation:
        'Trigger HOLD coordination at Palanpur DFC staging yard. Downstream vessel slot rescheduled to 03:30 AM IST. Mitigates ₹85,000 in missed feeder penalties.',
    };
  }
}
