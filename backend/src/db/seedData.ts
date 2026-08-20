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

export interface UserData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SHIPPER' | 'TRANSPORTER' | 'PORT_OPERATOR' | 'ADMIN';
  organization: string;
  corridorAccess: string[];
  phone: string;
}

export interface LegData {
  id: string;
  shipmentId: string;
  sequenceOrder: number;
  mode: 'ROAD' | 'RAIL' | 'PORT' | 'VESSEL' | 'WAREHOUSE';
  fromNode: string;
  toNode: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  delayMinutes: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'HELD' | 'SKIPPED';
  source: 'FOIS' | 'FASTAG' | 'PCS1X' | 'ICEGATE' | 'VAHAN' | 'IOT_TELEMETRY' | 'MOCK';
  assetId?: string;
  currentLat?: number;
  currentLng?: number;
  temperatureReadingCelsius?: number;
  lastTelemetryPing?: string;
  prediction?: PredictionData;
}

export interface PredictionData {
  id: string;
  legId: string;
  riskScore: number;
  riskLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedDelayMinutes: number;
  suggestedAction: 'PROCEED' | 'HOLD' | 'REROUTE' | 'RESCHEDULE' | 'ALERT_STAKEHOLDERS';
  plainLanguageReason: string;
  featureAttributions?: Record<string, any>;
  modelVersion: string;
  actionExecuted: boolean;
  predictedAt: string;
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
  currentMode: 'ROAD' | 'RAIL' | 'PORT' | 'VESSEL' | 'WAREHOUSE';
  status: 'CREATED' | 'IN_TRANSIT' | 'AT_HANDOFF' | 'DELAYED' | 'DELIVERED' | 'HELD' | 'REROUTED';
  cargoWeightTons: number;
  containerNumber: string;
  totalPlannedHours: number;
  cumulativeDelayMinutes: number;
  carbonEstimateKg: number;
  legs: LegData[];
  createdAt: string;
  updatedAt: string;
}

export const initialCorridors: CorridorData[] = [
  {
    id: 'cor-001',
    code: 'COR-LDH-MUN',
    name: 'Ludhiana to Mundra Port Export Corridor',
    origin: 'Ludhiana ICD, Punjab',
    destination: 'Mundra Port Terminal, Gujarat',
    primaryModes: ['ROAD', 'RAIL', 'PORT'],
    distanceKm: 1280.0,
    averageTransitHours: 36.5,
    dfcConnected: true,
    active: true,
  },
  {
    id: 'cor-002',
    code: 'COR-DEL-JNP',
    name: 'NCR Dadri to JNPT Gateway Corridor',
    origin: 'ICD Dadri, Greater Noida',
    destination: 'JNPT Port (Nhava Sheva), Mumbai',
    primaryModes: ['RAIL', 'PORT'],
    distanceKm: 1420.0,
    averageTransitHours: 42.0,
    dfcConnected: true,
    active: true,
  },
  {
    id: 'cor-003',
    code: 'COR-SOL-NHA',
    name: 'Solapur Cold-Chain Agro Corridor',
    origin: 'Solapur Agro Cluster, Maharashtra',
    destination: 'Nhava Sheva Gateway Port',
    primaryModes: ['ROAD', 'PORT'],
    distanceKm: 420.0,
    averageTransitHours: 14.0,
    dfcConnected: false,
    active: true,
  },
];

export const initialUsers: UserData[] = [
  {
    id: 'usr-001',
    name: 'Vikramaditya Sharma',
    email: 'ops.admin@jugaadjunction.in',
    passwordHash: '$2b$10$E9x8dY.mockhashedpasswordforadmin',
    role: 'ADMIN',
    organization: 'National Logistics Portal / Jugaad Junction',
    corridorAccess: ['ALL'],
    phone: '+91-98112-45001',
  },
  {
    id: 'usr-002',
    name: 'Harpreet Singh Sandhu',
    email: 'harpreet@punjabagrifresh.co.in',
    passwordHash: '$2b$10$E9x8dY.mockhashedpasswordforshipper',
    role: 'SHIPPER',
    organization: 'Punjab Agro Export Consortium',
    corridorAccess: ['COR-LDH-MUN'],
    phone: '+91-98765-12345',
  },
  {
    id: 'usr-003',
    name: 'Rajesh K. Verma',
    email: 'dispatch@delhidelhiverylogistics.in',
    passwordHash: '$2b$10$E9x8dY.mockhashedpasswordfortransporter',
    role: 'TRANSPORTER',
    organization: 'North India Intermodal Fleet',
    corridorAccess: ['COR-LDH-MUN', 'COR-DEL-JNP'],
    phone: '+91-99887-23456',
  },
  {
    id: 'usr-004',
    name: 'Captain Cyrus Mistry',
    email: 'terminal.master@mundraport.in',
    passwordHash: '$2b$10$E9x8dY.mockhashedpasswordforport',
    role: 'PORT_OPERATOR',
    organization: 'APSEZ Mundra Marine Operations',
    corridorAccess: ['COR-LDH-MUN'],
    phone: '+91-94260-98765',
  },
];

export const initialShipments: ShipmentData[] = [
  {
    id: 'shp-101',
    trackingNumber: 'SIH-2026-LDH-001',
    consignmentTitle: 'Kinnow Citrus & Fresh Produce Export',
    commodityType: 'Agricultural Citrus Fruit (Cold Chain)',
    isPerishable: true,
    targetTemperatureCelsius: 4.5,
    shipperId: 'usr-002',
    corridorId: 'cor-001',
    origin: 'Abohar / Ludhiana ICD',
    destination: 'Mundra Port Container Terminal',
    currentMode: 'RAIL',
    status: 'AT_HANDOFF',
    cargoWeightTons: 26.5,
    containerNumber: 'MSCU-908234-1',
    totalPlannedHours: 38.0,
    cumulativeDelayMinutes: 195,
    carbonEstimateKg: 412.0,
    createdAt: '2026-08-19T06:00:00.000Z',
    updatedAt: '2026-08-20T14:15:00.000Z',
    legs: [
      {
        id: 'leg-101-1',
        shipmentId: 'shp-101',
        sequenceOrder: 1,
        mode: 'ROAD',
        fromNode: 'Kinnow Orchard Farm / Abohar Hub',
        toNode: 'ICD Ludhiana (CONCOR Dry Port)',
        plannedStart: '2026-08-19T06:00:00.000Z',
        plannedEnd: '2026-08-19T10:00:00.000Z',
        actualStart: '2026-08-19T06:15:00.000Z',
        actualEnd: '2026-08-19T10:45:00.000Z',
        delayMinutes: 45,
        status: 'COMPLETED',
        source: 'FASTAG',
        assetId: 'PB-10-CZ-8812 (Tata Signa 4825.T)',
        currentLat: 30.901,
        currentLng: 75.8573,
        temperatureReadingCelsius: 4.2,
        lastTelemetryPing: '2026-08-19T10:45:00.000Z',
      },
      {
        id: 'leg-101-2',
        shipmentId: 'shp-101',
        sequenceOrder: 2,
        mode: 'WAREHOUSE',
        fromNode: 'ICD Ludhiana Reefer Stacking Yard',
        toNode: 'CONCOR Rake Siding Track 3',
        plannedStart: '2026-08-19T10:00:00.000Z',
        plannedEnd: '2026-08-19T14:00:00.000Z',
        actualStart: '2026-08-19T10:45:00.000Z',
        actualEnd: '2026-08-19T15:30:00.000Z',
        delayMinutes: 90,
        status: 'COMPLETED',
        source: 'ICEGATE',
        assetId: 'ICD-LDH-GATE-02',
        currentLat: 30.885,
        currentLng: 75.871,
        temperatureReadingCelsius: 4.6,
        lastTelemetryPing: '2026-08-19T15:30:00.000Z',
      },
      {
        id: 'leg-101-3',
        shipmentId: 'shp-101',
        sequenceOrder: 3,
        mode: 'RAIL',
        fromNode: 'ICD Ludhiana Rake Siding',
        toNode: 'Western DFC Rewari Hub -> Palanpur Junction',
        plannedStart: '2026-08-19T14:30:00.000Z',
        plannedEnd: '2026-08-20T08:30:00.000Z',
        actualStart: '2026-08-19T16:00:00.000Z',
        delayMinutes: 60,
        status: 'IN_PROGRESS',
        source: 'FOIS',
        assetId: 'WDFC Electric Loco Rake RK-9021',
        currentLat: 27.2038,
        currentLng: 73.7374,
        temperatureReadingCelsius: 5.1,
        lastTelemetryPing: '2026-08-20T14:10:00.000Z',
        prediction: {
          id: 'prd-101-3',
          legId: 'leg-101-3',
          riskScore: 0.884,
          riskLabel: 'HIGH',
          expectedDelayMinutes: 210,
          suggestedAction: 'HOLD',
          plainLanguageReason:
            'Mundra Port Berth 2 vessel MV Ocean Giant delayed by 9.5 hours due to tidal backlog. If train proceeds at normal speed, reefer container will sit in unshaded open yard with demurrage cost Rs 32,000. Recommend HOLD rake at Palanpur DFC staging yard for 4 hours to synchronize with adjusted berthing slot.',
          featureAttributions: {
            port_berth_congestion_factor: 0.72,
            railyard_dwell_factor: 0.28,
            road_toll_bottleneck_factor: 0.08,
            weather_impact_score: 0.05,
            perishable_spoilage_sensitivity: 0.85,
          },
          modelVersion: 'xgboost-v1.4.2',
          actionExecuted: false,
          predictedAt: '2026-08-20T14:12:00.000Z',
        },
      },
      {
        id: 'leg-101-4',
        shipmentId: 'shp-101',
        sequenceOrder: 4,
        mode: 'PORT',
        fromNode: 'Mundra Port Inward Rail Siding',
        toNode: 'Mundra Container Terminal (MICT Berth 2)',
        plannedStart: '2026-08-20T09:30:00.000Z',
        plannedEnd: '2026-08-20T16:30:00.000Z',
        status: 'PLANNED',
        source: 'PCS1X',
        assetId: 'PCS-MUN-GATE-4',
        currentLat: 22.839,
        currentLng: 69.7042,
      },
      {
        id: 'leg-101-5',
        shipmentId: 'shp-101',
        sequenceOrder: 5,
        mode: 'VESSEL',
        fromNode: 'Mundra Container Terminal Berth 2',
        toNode: 'Jebel Ali Container Port, UAE',
        plannedStart: '2026-08-20T18:00:00.000Z',
        plannedEnd: '2026-08-23T12:00:00.000Z',
        status: 'PLANNED',
        source: 'PCS1X',
        assetId: 'IMO-9482101-EVER-GIVEN',
        currentLat: 22.83,
        currentLng: 69.71,
      },
    ],
  },
  {
    id: 'shp-102',
    trackingNumber: 'SIH-2026-LDH-002',
    consignmentTitle: 'Industrial Precision Auto Spares',
    commodityType: 'Automotive Components (Tier-1)',
    isPerishable: false,
    shipperId: 'usr-001',
    corridorId: 'cor-001',
    origin: 'Ludhiana Industrial Hub',
    destination: 'Jebel Ali Port via Mundra',
    currentMode: 'ROAD',
    status: 'IN_TRANSIT',
    cargoWeightTons: 18.2,
    containerNumber: 'CMAU-482109-8',
    totalPlannedHours: 34.0,
    cumulativeDelayMinutes: 45,
    carbonEstimateKg: 780.0,
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-20T14:10:00.000Z',
    legs: [
      {
        id: 'leg-102-1',
        shipmentId: 'shp-102',
        sequenceOrder: 1,
        mode: 'ROAD',
        fromNode: 'Ludhiana Hero Hub',
        toNode: 'NH48 Kotputli / Jaipur Bypass Toll',
        plannedStart: '2026-08-20T08:00:00.000Z',
        plannedEnd: '2026-08-20T16:00:00.000Z',
        actualStart: '2026-08-20T08:10:00.000Z',
        delayMinutes: 45,
        status: 'IN_PROGRESS',
        source: 'FASTAG',
        assetId: 'HR-55-AB-4491 (Ashok Leyland 4220)',
        currentLat: 27.7012,
        currentLng: 76.1982,
        lastTelemetryPing: '2026-08-20T14:05:00.000Z',
        prediction: {
          id: 'prd-102-1',
          legId: 'leg-102-1',
          riskScore: 0.765,
          riskLabel: 'HIGH',
          expectedDelayMinutes: 180,
          suggestedAction: 'REROUTE',
          plainLanguageReason:
            'NH-48 Shahjahanpur / Kotputli toll experiencing 4.8-hour bottleneck due to highway resurfacing. Suggest REROUTE via Rewari ICD Western DFC Roll-on/Roll-off rail rake to save 3.5 hours and reduce carbon footprint by 420 kg CO2.',
          featureAttributions: {
            road_toll_bottleneck_factor: 0.88,
            weather_impact_score: 0.05,
          },
          modelVersion: 'xgboost-v1.4.2',
          actionExecuted: false,
          predictedAt: '2026-08-20T14:08:00.000Z',
        },
      },
      {
        id: 'leg-102-2',
        shipmentId: 'shp-102',
        sequenceOrder: 2,
        mode: 'PORT',
        fromNode: 'Mundra Port Gate Entry',
        toNode: 'Mundra Container Yard Bay 12',
        plannedStart: '2026-08-21T06:00:00.000Z',
        plannedEnd: '2026-08-21T18:00:00.000Z',
        status: 'PLANNED',
        source: 'PCS1X',
        currentLat: 22.839,
        currentLng: 69.7042,
      },
    ],
  },
  {
    id: 'shp-103',
    trackingNumber: 'SIH-2026-DEL-003',
    consignmentTitle: 'Solar Inverters & High-Tech Hardware',
    commodityType: 'Electronics & CleanTech',
    isPerishable: false,
    shipperId: 'usr-001',
    corridorId: 'cor-002',
    origin: 'Noida / ICD Dadri',
    destination: 'Rotterdam via JNPT',
    currentMode: 'RAIL',
    status: 'IN_TRANSIT',
    cargoWeightTons: 22.0,
    containerNumber: 'TGHU-773412-0',
    totalPlannedHours: 44.0,
    cumulativeDelayMinutes: 15,
    carbonEstimateKg: 340.0,
    createdAt: '2026-08-19T18:00:00.000Z',
    updatedAt: '2026-08-20T13:30:00.000Z',
    legs: [
      {
        id: 'leg-103-1',
        shipmentId: 'shp-103',
        sequenceOrder: 1,
        mode: 'RAIL',
        fromNode: 'ICD Dadri WDFC Freight Terminal',
        toNode: 'JNPT Port Rake Siding',
        plannedStart: '2026-08-19T20:00:00.000Z',
        plannedEnd: '2026-08-20T22:00:00.000Z',
        actualStart: '2026-08-19T20:15:00.000Z',
        delayMinutes: 15,
        status: 'IN_PROGRESS',
        source: 'FOIS',
        assetId: 'WDFC Superfast Freight Rake-411',
        currentLat: 20.9042,
        currentLng: 74.7749,
        lastTelemetryPing: '2026-08-20T13:30:00.000Z',
        prediction: {
          id: 'prd-103-1',
          legId: 'leg-103-1',
          riskScore: 0.182,
          riskLabel: 'LOW',
          expectedDelayMinutes: 15,
          suggestedAction: 'PROCEED',
          plainLanguageReason:
            'WDFC Western dedicated track operating at optimal throughput (75 km/h avg speed). JNPT Port Berth 4 turnaround on schedule. All downstream slots confirmed.',
          modelVersion: 'xgboost-v1.4.2',
          actionExecuted: false,
          predictedAt: '2026-08-20T13:35:00.000Z',
        },
      },
    ],
  },
];
