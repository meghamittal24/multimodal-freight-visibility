export type TransportMode = 'ROAD' | 'RAIL' | 'PORT' | 'VESSEL' | 'WAREHOUSE';
export type ShipmentStatus = 'CREATED' | 'IN_TRANSIT' | 'AT_HANDOFF' | 'DELAYED' | 'DELIVERED' | 'HELD' | 'REROUTED';
export type LegStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'HELD' | 'SKIPPED';
export type RiskLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SuggestedAction = 'PROCEED' | 'HOLD' | 'REROUTE' | 'RESCHEDULE' | 'ALERT_STAKEHOLDERS';
export type UserRole = 'SHIPPER' | 'TRANSPORTER' | 'PORT_OPERATOR' | 'ADMIN';

export interface PredictionData {
  id: string;
  legId: string;
  riskScore: number;
  riskLabel: RiskLabel;
  expectedDelayMinutes: number;
  suggestedAction: SuggestedAction;
  plainLanguageReason: string;
  featureAttributions?: Record<string, number | boolean>;
  modelVersion: string;
  actionExecuted: boolean;
  predictedAt: string;
}

export interface LegData {
  id: string;
  shipmentId: string;
  sequenceOrder: number;
  mode: TransportMode;
  fromNode: string;
  toNode: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  delayMinutes: number;
  status: LegStatus;
  source: 'FOIS' | 'FASTAG' | 'PCS1X' | 'ICEGATE' | 'VAHAN' | 'IOT_TELEMETRY' | 'MOCK';
  assetId?: string;
  currentLat?: number;
  currentLng?: number;
  temperatureReadingCelsius?: number;
  lastTelemetryPing?: string;
  prediction?: PredictionData;
}

export interface ShipmentData {
  id: string;
  trackingNumber: string;
  consignmentTitle: string;
  commodityType: string;
  isPerishable: boolean;
  targetTemperatureCelsius?: number;
  shipperId: string;
  corridorId: string;
  origin: string;
  destination: string;
  currentMode: TransportMode;
  status: ShipmentStatus;
  cargoWeightTons: number;
  containerNumber: string;
  totalPlannedHours: number;
  cumulativeDelayMinutes: number;
  carbonEstimateKg: number;
  legs: LegData[];
  createdAt: string;
  updatedAt: string;
}

export interface CorridorData {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  primaryModes: string[];
  distanceKm: number;
  averageTransitHours: number;
  dfcConnected: boolean;
  active: boolean;
}

export interface ImpactMetrics {
  nationalLogisticsPolicy: {
    indiaCurrentGdpPct: number;
    developedEconomiesTargetPct: number;
    targetSavingsOpportunityBillionUsd: number;
    estimatedPlatformEfficiencyGainPct: number;
  };
  liveOperationalKpis: {
    activeShipments: number;
    totalTonnageMoved: number;
    averageDelayMinutes: number;
    onTimeHandoffPercentage: number;
    predictedVsActualModelAccuracyPct: number;
    demurrageSavedInr: number;
    carbonAbatedKgCo2: number;
    perishableSpoilageAvoidanceRatePct: number;
  };
  modalShareSplit: {
    roadPct: number;
    railDfcPct: number;
    portVesselPct: number;
  };
  delayAttributionSummary: Array<{ cause: string; percentage: number }>;
}

export interface RippleEffectGraph {
  shipmentId: string;
  primaryDelayCause: string;
  totalDownstreamDelayMinutes: number;
  totalEstimatedLossInr: number;
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    mode?: string;
    status: string;
    delayMinutes: number;
    cascadingImpactCostInr: number;
    riskScore: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    relation: string;
    propagationFactor: number;
  }>;
  mitigationRecommendation: string;
}
