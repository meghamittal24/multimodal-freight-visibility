import { PrismaClient, TransportMode, ShipmentStatus, LegStatus, DataSource, RiskLevel, SuggestedActionType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multimodal Freight Visibility Platform Database...');

  // 1. Create Pilot Corridors
  const corridor1 = await prisma.corridor.upsert({
    where: { code: 'COR-LDH-MUN' },
    update: {},
    create: {
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
  });

  const corridor2 = await prisma.corridor.upsert({
    where: { code: 'COR-DEL-JNP' },
    update: {},
    create: {
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
  });

  // 2. Create Users (Shippers, Transporters, Port Operators, Admins)
  const adminUser = await prisma.user.upsert({
    where: { email: 'ops.admin@jugaadjunction.in' },
    update: {},
    create: {
      id: 'usr-001',
      name: 'Vikramaditya Sharma',
      email: 'ops.admin@jugaadjunction.in',
      passwordHash: '$2b$10$E9x8dY.mockhashedpasswordforadmin',
      role: UserRole.ADMIN,
      organization: 'National Logistics Portal / Jugaad Junction',
      corridorAccess: ['ALL'],
      phone: '+91-98112-45001',
    },
  });

  const shipperUser = await prisma.user.upsert({
    where: { email: 'harpreet@punjabagrifresh.co.in' },
    update: {},
    create: {
      id: 'usr-002',
      name: 'Harpreet Singh Sandhu',
      email: 'harpreet@punjabagrifresh.co.in',
      passwordHash: '$2b$10$E9x8dY.mockhashedpasswordforshipper',
      role: UserRole.SHIPPER,
      organization: 'Punjab Agro Export Consortium',
      corridorAccess: ['COR-LDH-MUN'],
      phone: '+91-98765-12345',
    },
  });

  // 3. Create Hero Multimodal Shipment: Ludhiana Kinnow Export to Mundra
  const shipment1 = await prisma.shipment.upsert({
    where: { trackingNumber: 'SIH-2026-LDH-001' },
    update: {},
    create: {
      id: 'shp-101',
      trackingNumber: 'SIH-2026-LDH-001',
      consignmentTitle: 'Kinnow Citrus & Fresh Produce Export',
      commodityType: 'Agricultural Citrus Fruit (Cold Chain)',
      isPerishable: true,
      targetTemperatureCelsius: 4.5,
      shipperId: shipperUser.id,
      corridorId: corridor1.id,
      origin: 'Abohar / Ludhiana ICD',
      destination: 'Mundra Port Container Terminal',
      currentMode: TransportMode.RAIL,
      status: ShipmentStatus.AT_HANDOFF,
      cargoWeightTons: 26.5,
      containerNumber: 'MSCU-908234-1',
      totalPlannedHours: 38.0,
      cumulativeDelayMinutes: 195,
      carbonEstimateKg: 412.0,
      legs: {
        create: [
          {
            id: 'leg-101-1',
            sequenceOrder: 1,
            mode: TransportMode.ROAD,
            fromNode: 'Kinnow Orchard Farm / Ludhiana Hub',
            toNode: 'ICD Ludhiana (CONCOR Dry Port)',
            plannedStart: new Date('2026-08-19T06:00:00+05:30'),
            plannedEnd: new Date('2026-08-19T10:00:00+05:30'),
            actualStart: new Date('2026-08-19T06:15:00+05:30'),
            actualEnd: new Date('2026-08-19T10:45:00+05:30'),
            delayMinutes: 45,
            status: LegStatus.COMPLETED,
            source: DataSource.FASTAG,
            assetId: 'PB-10-CZ-8812',
            currentLat: 30.901,
            currentLng: 75.8573,
            temperatureReadingCelsius: 4.2,
          },
          {
            id: 'leg-101-2',
            sequenceOrder: 2,
            mode: TransportMode.WAREHOUSE,
            fromNode: 'ICD Ludhiana Aggregation & Customs Scan',
            toNode: 'ICD Rake Siding Track 3',
            plannedStart: new Date('2026-08-19T10:00:00+05:30'),
            plannedEnd: new Date('2026-08-19T14:00:00+05:30'),
            actualStart: new Date('2026-08-19T10:45:00+05:30'),
            actualEnd: new Date('2026-08-19T15:30:00+05:30'),
            delayMinutes: 90,
            status: LegStatus.COMPLETED,
            source: DataSource.ICEGATE,
            assetId: 'ICD-LDH-GATE-02',
            currentLat: 30.885,
            currentLng: 75.871,
            temperatureReadingCelsius: 4.8,
          },
          {
            id: 'leg-101-3',
            sequenceOrder: 3,
            mode: TransportMode.RAIL,
            fromNode: 'ICD Ludhiana Rake Siding',
            toNode: 'Western DFC Rewari Hub -> Palanpur Junction',
            plannedStart: new Date('2026-08-19T14:30:00+05:30'),
            plannedEnd: new Date('2026-08-20T08:30:00+05:30'),
            actualStart: new Date('2026-08-19T16:00:00+05:30'),
            delayMinutes: 60,
            status: LegStatus.IN_PROGRESS,
            source: DataSource.FOIS,
            assetId: 'RAKE-WDFC-9021',
            currentLat: 27.2038,
            currentLng: 73.7374,
            temperatureReadingCelsius: 5.1,
            predictions: {
              create: [
                {
                  id: 'prd-101-3',
                  riskScore: 0.884,
                  riskLabel: RiskLevel.HIGH,
                  expectedDelayMinutes: 210,
                  suggestedAction: SuggestedActionType.HOLD,
                  plainLanguageReason:
                    'Mundra Port Berth 2 vessel MV Ocean Giant delayed by 9.5 hours due to tidal backlog. Suggest HOLD rake at Palanpur DFC staging yard for 4 hours to synchronize with berthing and save Rs 32,000 demurrage.',
                  modelVersion: 'xgboost-v1.4.2',
                },
              ],
            },
          },
          {
            id: 'leg-101-4',
            sequenceOrder: 4,
            mode: TransportMode.PORT,
            fromNode: 'Mundra Port Inward Rail Siding',
            toNode: 'Mundra Container Terminal (MICT Berth 2)',
            plannedStart: new Date('2026-08-20T09:30:00+05:30'),
            plannedEnd: new Date('2026-08-20T16:30:00+05:30'),
            status: LegStatus.PLANNED,
            source: DataSource.PCS1X,
            assetId: 'PCS-MUN-GATE-4',
            currentLat: 22.839,
            currentLng: 69.7042,
          },
          {
            id: 'leg-101-5',
            sequenceOrder: 5,
            mode: TransportMode.VESSEL,
            fromNode: 'Mundra Container Terminal Berth 2',
            toNode: 'Jebel Ali Container Port, UAE',
            plannedStart: new Date('2026-08-20T18:00:00+05:30'),
            plannedEnd: new Date('2026-08-23T12:00:00+05:30'),
            status: LegStatus.PLANNED,
            source: DataSource.PCS1X,
            assetId: 'IMO-9482101-EVER-GIVEN',
            currentLat: 22.83,
            currentLng: 69.71,
          },
        ],
      },
    },
  });

  console.log('Seeded database successfully with Hero Shipment:', shipment1.trackingNumber);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
