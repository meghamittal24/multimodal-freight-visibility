import {
  initialCorridors,
  initialUsers,
  initialShipments,
  CorridorData,
  UserData,
  ShipmentData,
  LegData,
  PredictionData,
} from './seedData';

export interface TrackingEventRecord {
  id: string;
  shipmentId: string;
  legId?: string;
  source: string;
  eventName: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  eventTimestamp: string;
  rawPayload?: Record<string, any>;
}

export interface CoordinationAlertRecord {
  id: string;
  shipmentId: string;
  predictionId?: string;
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  recommendedAction: string;
  actionTaken?: string;
  acknowledged: boolean;
  createdAt: string;
}

class InMemoryDataStore {
  public corridors: Map<string, CorridorData> = new Map();
  public users: Map<string, UserData> = new Map();
  public shipments: Map<string, ShipmentData> = new Map();
  public trackingEvents: TrackingEventRecord[] = [];
  public alerts: CoordinationAlertRecord[] = [];

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed() {
    this.corridors.clear();
    this.users.clear();
    this.shipments.clear();
    this.trackingEvents = [];
    this.alerts = [];

    initialCorridors.forEach((c) => this.corridors.set(c.id, { ...c }));
    initialUsers.forEach((u) => this.users.set(u.id, { ...u }));
    
    // Deep clone shipments
    initialShipments.forEach((s) => {
      this.shipments.set(s.id, JSON.parse(JSON.stringify(s)));
    });

    // Seed default alerts
    this.alerts.push({
      id: 'alt-001',
      shipmentId: 'shp-101',
      predictionId: 'prd-101-3',
      alertType: 'PORT_BERTH_CONGESTION',
      severity: 'HIGH',
      title: 'Mundra Port Berth 2 Tidal Delay Alert',
      message: 'Vessel MV Ocean Giant delayed by 9.5 hours. Recommended: HOLD rake at Palanpur DFC hub.',
      recommendedAction: 'HOLD',
      acknowledged: false,
      createdAt: new Date().toISOString(),
    });
  }

  public getAllShipments(filters?: { corridorId?: string; mode?: string; status?: string }): ShipmentData[] {
    let list = Array.from(this.shipments.values());
    if (filters?.corridorId) {
      list = list.filter((s) => s.corridorId === filters.corridorId);
    }
    if (filters?.mode) {
      list = list.filter((s) => s.currentMode === filters.mode);
    }
    if (filters?.status) {
      list = list.filter((s) => s.status === filters.status);
    }
    return list;
  }

  public getShipmentById(id: string): ShipmentData | undefined {
    return this.shipments.get(id);
  }

  public updateShipment(id: string, updates: Partial<ShipmentData>): ShipmentData | undefined {
    const existing = this.shipments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.shipments.set(id, updated);
    return updated;
  }

  public getLeg(shipmentId: string, legId: string): LegData | undefined {
    const s = this.shipments.get(shipmentId);
    return s?.legs.find((l) => l.id === legId);
  }

  public updateLeg(shipmentId: string, legId: string, updates: Partial<LegData>): LegData | undefined {
    const s = this.shipments.get(shipmentId);
    if (!s) return undefined;
    const legIdx = s.legs.findIndex((l) => l.id === legId);
    if (legIdx === -1) return undefined;

    s.legs[legIdx] = { ...s.legs[legIdx], ...updates };
    s.updatedAt = new Date().toISOString();
    return s.legs[legIdx];
  }

  public addTrackingEvent(event: Omit<TrackingEventRecord, 'id' | 'eventTimestamp'>): TrackingEventRecord {
    const record: TrackingEventRecord = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventTimestamp: new Date().toISOString(),
      ...event,
    };
    this.trackingEvents.unshift(record);
    return record;
  }

  public getAlerts(): CoordinationAlertRecord[] {
    return this.alerts;
  }

  public acknowledgeAlert(id: string): boolean {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
}

export const dataStore = new InMemoryDataStore();
