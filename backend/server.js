import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import { Block, Blockchain, restoreBlockchain } from './blockchain.js';

const PORT = process.env.PORT || 5000;
const DB_PATH = './db.json';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Pre-defined routes (GPS paths)
const RAIL_ROUTE = [
  [28.6429, 77.2191], // Delhi Railway Yard
  [27.4924, 77.6737], // Mathura
  [27.1578, 77.9609], // Agra
  [26.2183, 78.1828], // Gwalior
  [25.4484, 78.5685], // Jhansi
  [24.4822, 77.7241], // Bina
  [23.2599, 77.4126], // Bhopal
  [22.6133, 77.7554], // Itarsi
  [21.8286, 76.3533], // Khandwa
  [21.0478, 75.7876], // Bhusawal
  [20.2520, 74.4363], // Manmad
  [19.9975, 73.7898], // Nasik
  [19.2346, 73.1360], // Kalyan
  [19.0178, 72.8478], // Mumbai Railway Yard (Handover Point)
];

const ROAD_ROUTE = [
  [19.0178, 72.8478], // Mumbai Railway Yard
  [19.0390, 72.8619], // Sion
  [19.0650, 72.8794], // Kurla
  [19.0863, 72.9080], // Ghatkopar
  [19.1136, 72.9060], // Mumbai Warehouse (Destination)
];

const ROAD_ROUTE_DEVIATION = [
  [19.0178, 72.8478], // Mumbai Railway Yard
  [19.0390, 72.8619], // Sion
  [19.0433, 72.8188], // Bandra Reclamation (Deviating West!)
  [19.1000, 72.8250], // Juhu Beach
  [19.1350, 72.8150], // Versova (Way off route)
];

// Helper to load/save DB
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    return initSeedData();
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return data;
  } catch (err) {
    console.error('Error reading DB, seeding fresh:', err);
    return initSeedData();
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Seed Initial Data on first run
function initSeedData() {
  console.log('Seeding initial dataset...');
  const blockchain = new Blockchain();

  // Pre-seeded shipments
  const shipments = [
    {
      id: 'SHIP-001',
      sender: 'Delhi Pharma Corp',
      receiver: 'Mumbai Health Center',
      cargoType: 'Medicines',
      weight: 1500,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
      status: 'Delivered',
      currentLocation: [19.1136, 72.9060],
      vehicle: 'Truck',
      routeType: 'Road',
      pathIndex: 4,
      alert: null,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SHIP-001',
    },
    {
      id: 'SHIP-002',
      sender: 'Agro Tech Delhi',
      receiver: 'Western Distributors',
      cargoType: 'General',
      weight: 8500,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
      status: 'In Transit - Rail',
      currentLocation: RAIL_ROUTE[4],
      vehicle: 'Train',
      routeType: 'Rail',
      pathIndex: 4,
      alert: null,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SHIP-002',
    },
    {
      id: 'SHIP-003',
      sender: 'Apex Chemicals',
      receiver: 'Mumbai Logistics Hub',
      cargoType: 'Chemicals',
      weight: 3200,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
      status: 'At Handover Point',
      currentLocation: RAIL_ROUTE[13],
      vehicle: 'Train',
      routeType: 'Rail',
      pathIndex: 13,
      alert: null,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SHIP-003',
    },
    {
      id: 'SHIP-004',
      sender: 'Vanguard Jewels',
      receiver: 'Mumbai Safe House',
      cargoType: 'High-Value',
      weight: 450,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
      status: 'In Transit - Road',
      currentLocation: ROAD_ROUTE_DEVIATION[3],
      vehicle: 'Truck',
      routeType: 'Road',
      pathIndex: 3,
      isDeviated: true,
      alert: {
        type: 'Route Deviation',
        message: 'CRITICAL: Truck deviated 4.2km from standard road route!',
        timestamp: new Date().toISOString(),
      },
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SHIP-004',
    },
  ];

  // Block 1: SHIP-001 Created
  blockchain.addBlock(
    new Block(1, '2026-08-14T10:00:00.000Z', {
      type: 'CREATE',
      shipmentId: 'SHIP-001',
      sender: 'Delhi Pharma Corp',
      receiver: 'Mumbai Health Center',
      cargoType: 'Medicines',
      weight: 1500,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
    })
  );

  // Block 2: SHIP-001 Handover Verified
  blockchain.addBlock(
    new Block(2, '2026-08-14T12:30:00.000Z', {
      type: 'HANDOVER',
      shipmentId: 'SHIP-001',
      officer: 'R. K. Sharma (Railways)',
      driver: 'Amit Singh (MH-12-G-4412)',
      weightConfirmed: 1500,
      signatureHash: '0x7f3b821a9de4c1d683a7585aef01b349281a',
    })
  );

  // Block 3: SHIP-001 Delivered
  blockchain.addBlock(
    new Block(3, '2026-08-14T14:15:00.000Z', {
      type: 'DELIVERY',
      shipmentId: 'SHIP-001',
      recipientSignature: '0x992cf4a29ab8126b8cf928a381de0172bf421',
      status: 'VERIFIED_DELIVERED',
    })
  );

  // Block 4: SHIP-002 Created
  blockchain.addBlock(
    new Block(4, '2026-08-14T16:00:00.000Z', {
      type: 'CREATE',
      shipmentId: 'SHIP-002',
      sender: 'Agro Tech Delhi',
      receiver: 'Western Distributors',
      cargoType: 'General',
      weight: 8500,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
    })
  );

  // Block 5: SHIP-003 Created
  blockchain.addBlock(
    new Block(5, '2026-08-14T18:00:00.000Z', {
      type: 'CREATE',
      shipmentId: 'SHIP-003',
      sender: 'Apex Chemicals',
      receiver: 'Mumbai Logistics Hub',
      cargoType: 'Chemicals',
      weight: 3200,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
    })
  );

  // Block 6: SHIP-004 Created
  blockchain.addBlock(
    new Block(6, '2026-08-14T19:00:00.000Z', {
      type: 'CREATE',
      shipmentId: 'SHIP-004',
      sender: 'Vanguard Jewels',
      receiver: 'Mumbai Safe House',
      cargoType: 'High-Value',
      weight: 450,
      origin: 'Delhi Railway Yard',
      destination: 'Mumbai Warehouse',
    })
  );

  // Block 7: SHIP-004 Handover
  blockchain.addBlock(
    new Block(7, '2026-08-14T21:00:00.000Z', {
      type: 'HANDOVER',
      shipmentId: 'SHIP-004',
      officer: 'S. K. Verma (Railways)',
      driver: 'Karan Johar (MH-02-F-9901)',
      weightConfirmed: 450,
      signatureHash: '0xab88d234a9ef1cde22881b374dcf73661e73',
    })
  );

  // Block 8: SHIP-004 Deviation Alert
  blockchain.addBlock(
    new Block(8, '2026-08-14T22:30:00.000Z', {
      type: 'INCIDENT',
      subtype: 'ROUTE_DEVIATION',
      shipmentId: 'SHIP-004',
      message: 'CRITICAL: Truck deviated 4.2km from standard road route!',
      lastKnownGPS: ROAD_ROUTE_DEVIATION[3],
    })
  );

  const dbData = {
    shipments,
    chain: blockchain.chain,
    alerts: [
      {
        id: 'A-001',
        shipmentId: 'SHIP-004',
        type: 'deviation',
        title: 'Route Deviation Alert',
        message: 'Shipment SHIP-004 (High-Value) has deviated from path near Sion!',
        timestamp: new Date().toISOString(),
        severity: 'high',
      },
    ],
  };

  saveDB(dbData);
  return dbData;
}

// ----------------------------------------------------
// REST APIs
// ----------------------------------------------------

// Get shipments
app.get('/api/shipments', (req, res) => {
  const db = loadDB();
  res.json(db.shipments);
});

// Create shipment
app.post('/api/shipments', async (req, res) => {
  const { sender, receiver, cargoType, weight, origin, destination } = req.body;
  if (!sender || !receiver || !cargoType || !weight || !origin || !destination) {
    return res.status(400).json({ error: 'Missing required shipment details' });
  }

  const db = loadDB();
  const newId = `SHIP-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${newId}`;

  const newShipment = {
    id: newId,
    sender,
    receiver,
    cargoType,
    weight: Number(weight),
    origin,
    destination,
    status: 'In Transit - Rail',
    currentLocation: RAIL_ROUTE[0],
    vehicle: 'Train',
    routeType: 'Rail',
    pathIndex: 0,
    alert: null,
    qrCodeUrl,
  };

  // Add block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'CREATE',
    shipmentId: newId,
    sender,
    receiver,
    cargoType,
    weight: Number(weight),
    origin,
    destination,
  };
  const newBlock = new Block(blockchain.chain.length, new Date().toISOString(), blockData);
  blockchain.addBlock(newBlock);

  db.shipments.push(newShipment);
  db.chain = blockchain.chain;

  saveDB(db);

  io.emit('shipment_created', newShipment);
  io.emit('chain_updated', db.chain);

  res.status(201).json({ shipment: newShipment, block: newBlock });
});

// Handover Verification
app.post('/api/shipments/:id/handover', (req, res) => {
  const { id } = req.params;
  const { officerName, weightConfirmed, signatureHash } = req.body;

  if (!officerName || !weightConfirmed || !signatureHash) {
    return res.status(400).json({ error: 'Missing handover signatures/weights' });
  }

  const db = loadDB();
  const shipmentIdx = db.shipments.findIndex(s => s.id === id);

  if (shipmentIdx === -1) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const shipment = db.shipments[shipmentIdx];
  shipment.status = 'In Transit - Road';
  shipment.vehicle = 'Truck';
  shipment.routeType = 'Road';
  shipment.pathIndex = 0;
  shipment.currentLocation = ROAD_ROUTE[0];

  // Append block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'HANDOVER',
    shipmentId: id,
    officer: officerName,
    driver: 'M. K. Yadav (MH-04-A-1290)',
    weightConfirmed: Number(weightConfirmed),
    signatureHash,
  };
  const newBlock = new Block(blockchain.chain.length, new Date().toISOString(), blockData);
  blockchain.addBlock(newBlock);

  // Clear handover alerts if any
  db.alerts = db.alerts.filter(a => !(a.shipmentId === id && a.type === 'handover_pending'));
  db.chain = blockchain.chain;

  saveDB(db);

  io.emit('shipment_update', shipment);
  io.emit('chain_updated', db.chain);

  res.json({ success: true, shipment, block: newBlock });
});

// Simulate route deviation
app.post('/api/shipments/:id/deviation', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const shipment = db.shipments.find(s => s.id === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  if (shipment.status !== 'In Transit - Road') {
    return res.status(400).json({ error: 'Deviation simulation requires road transit state' });
  }

  shipment.isDeviated = true;
  shipment.pathIndex = 2; // jump onto the deviation path immediately
  shipment.currentLocation = ROAD_ROUTE_DEVIATION[2];
  shipment.alert = {
    type: 'Route Deviation',
    message: 'CRITICAL: Route deviation detected! Vehicle off-course.',
    timestamp: new Date().toISOString(),
  };

  const alertObj = {
    id: 'A-' + Math.random().toString(36).substr(2, 9),
    shipmentId: id,
    type: 'deviation',
    title: 'Route Deviation Alert',
    message: `CRITICAL: Shipment ${id} (Truck) has deviated from path near Bandra!`,
    timestamp: new Date().toISOString(),
    severity: 'high',
  };
  db.alerts.unshift(alertObj);

  // Append block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'INCIDENT',
    subtype: 'ROUTE_DEVIATION',
    shipmentId: id,
    message: alertObj.message,
    lastKnownGPS: shipment.currentLocation,
  };
  blockchain.addBlock(new Block(blockchain.chain.length, new Date().toISOString(), blockData));

  db.chain = blockchain.chain;
  saveDB(db);

  io.emit('new_alert', alertObj);
  io.emit('shipment_update', shipment);
  io.emit('chain_updated', db.chain);

  res.json({ success: true, shipment });
});

// Simulate accident
app.post('/api/shipments/:id/accident', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const shipment = db.shipments.find(s => s.id === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  shipment.status = 'Accident Alert';
  shipment.alert = {
    type: 'Accident Alert',
    message: 'CRITICAL: Impact sensor triggered. Roll stability drop.',
    timestamp: new Date().toISOString(),
  };

  const alertObj = {
    id: 'A-' + Math.random().toString(36).substr(2, 9),
    shipmentId: id,
    type: 'accident',
    title: 'Accident Incident Reported',
    message: `EMERGENCY: Impact sensor triggered for ${id}. Dispatched medical aid to GPS ${shipment.currentLocation}.`,
    timestamp: new Date().toISOString(),
    severity: 'critical',
    emergencyContact: {
      hospital: 'Sion General Municipal Hospital',
      distance: '1.8 km',
      phone: '+91-22-24076381',
      coords: [19.0360, 72.8601],
    },
  };
  db.alerts.unshift(alertObj);

  // Append block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'INCIDENT',
    subtype: 'ACCIDENT',
    shipmentId: id,
    message: alertObj.message,
    coordinates: shipment.currentLocation,
    emergencyDispatched: true,
    hospitalContact: alertObj.emergencyContact.hospital,
  };
  blockchain.addBlock(new Block(blockchain.chain.length, new Date().toISOString(), blockData));

  db.chain = blockchain.chain;
  saveDB(db);

  io.emit('new_alert', alertObj);
  io.emit('shipment_update', shipment);
  io.emit('chain_updated', db.chain);

  res.json({ success: true, shipment, alert: alertObj });
});

// Driver panic (Silent SOS)
app.post('/api/shipments/:id/panic', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const shipment = db.shipments.find(s => s.id === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const alertObj = {
    id: 'A-' + Math.random().toString(36).substr(2, 9),
    shipmentId: id,
    type: 'panic',
    title: 'Driver Silent SOS Alert',
    message: `SECURITY BREAK: Driver has triggered silent panic button for ${id}! Immediate action required.`,
    timestamp: new Date().toISOString(),
    severity: 'critical',
  };
  db.alerts.unshift(alertObj);

  // Append block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'INCIDENT',
    subtype: 'SILENT_PANIC',
    shipmentId: id,
    message: 'SOS: Driver silent alarm triggered.',
    lastKnownGPS: shipment.currentLocation,
  };
  blockchain.addBlock(new Block(blockchain.chain.length, new Date().toISOString(), blockData));

  db.chain = blockchain.chain;
  saveDB(db);

  io.emit('new_alert', alertObj);
  io.emit('chain_updated', db.chain);

  res.json({ success: true, message: 'Panic signal transmitted.' });
});

// QR-based Delivery Confirmation
app.post('/api/shipments/:id/deliver', (req, res) => {
  const { id } = req.params;
  const { recipientSignature } = req.body;

  const db = loadDB();
  const shipment = db.shipments.find(s => s.id === id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  shipment.status = 'Delivered';
  shipment.alert = null;
  shipment.currentLocation = ROAD_ROUTE[ROAD_ROUTE.length - 1];

  // Append block to blockchain
  const blockchain = restoreBlockchain(db.chain);
  const blockData = {
    type: 'DELIVERY',
    shipmentId: id,
    recipientSignature: recipientSignature || '0x992cf4a29ab8126b8cf928a381de0172bf421',
    status: 'VERIFIED_DELIVERED',
  };
  blockchain.addBlock(new Block(blockchain.chain.length, new Date().toISOString(), blockData));

  db.chain = blockchain.chain;
  saveDB(db);

  io.emit('shipment_update', shipment);
  io.emit('chain_updated', db.chain);

  res.json({ success: true, shipment, block: db.chain[db.chain.length - 1] });
});

// Get blockchain
app.get('/api/blockchain', (req, res) => {
  const db = loadDB();
  const blockchain = restoreBlockchain(db.chain);
  const validation = blockchain.isChainValid();

  res.json({
    chain: db.chain,
    isValid: validation.isValid,
    tamperedIndex: validation.tamperedIndex,
    reason: validation.reason,
  });
});

// Tamper past block data
app.post('/api/blockchain/tamper', (req, res) => {
  const { index, field, value } = req.body;
  if (index === undefined || !field) {
    return res.status(400).json({ error: 'Missing index or field name to tamper' });
  }

  const db = loadDB();
  if (index < 0 || index >= db.chain.length) {
    return res.status(404).json({ error: 'Block index out of bounds' });
  }

  // Inject tampered values into data
  db.chain[index].data[field] = value;
  // NOTE: We do not recompute the block hash, nor do we update next block's previousHash,
  // which causes the chain check to fail.
  saveDB(db);

  io.emit('chain_updated', db.chain);

  // Run validity check to return report
  const blockchain = restoreBlockchain(db.chain);
  const validation = blockchain.isChainValid();

  res.json({
    success: true,
    chain: db.chain,
    isValid: validation.isValid,
    tamperedIndex: validation.tamperedIndex,
    reason: validation.reason,
  });
});

// Reset Database and Blockchain
app.post('/api/blockchain/reset', (req, res) => {
  const freshData = initSeedData();
  io.emit('shipments_reset', freshData.shipments);
  io.emit('chain_updated', freshData.chain);
  res.json({ success: true, message: 'Database reset to original seed state.' });
});

// Get active alerts
app.get('/api/alerts', (req, res) => {
  const db = loadDB();
  res.json(db.alerts);
});

// ----------------------------------------------------
// Real-time GPS movement simulation interval
// ----------------------------------------------------
setInterval(() => {
  const db = loadDB();
  let updated = false;

  db.shipments = db.shipments.map(s => {
    if (s.status === 'In Transit - Rail') {
      s.pathIndex = s.pathIndex + 1;
      if (s.pathIndex >= RAIL_ROUTE.length) {
        // Arrived at Handover point
        s.status = 'At Handover Point';
        s.currentLocation = RAIL_ROUTE[RAIL_ROUTE.length - 1];
        s.pathIndex = RAIL_ROUTE.length - 1;

        // Trigger Alert
        const alert = {
          id: 'A-' + Math.random().toString(36).substr(2, 9),
          shipmentId: s.id,
          type: 'handover_pending',
          title: 'Handover Pending',
          message: `Shipment ${s.id} arrived at Mumbai Railway Yard. Verification required for road transition.`,
          timestamp: new Date().toISOString(),
          severity: 'info',
        };
        db.alerts.unshift(alert);
        io.emit('new_alert', alert);
        io.emit('shipment_update', s);

        // Add to blockchain
        const blockchain = restoreBlockchain(db.chain);
        blockchain.addBlock(
          new Block(blockchain.chain.length, new Date().toISOString(), {
            type: 'STATUS_UPDATE',
            shipmentId: s.id,
            status: 'ARRIVED_HANDOVER_POINT',
            location: s.currentLocation,
          })
        );
        db.chain = blockchain.chain;
        updated = true;
      } else {
        s.currentLocation = RAIL_ROUTE[s.pathIndex];
        io.emit('gps_update', { id: s.id, currentLocation: s.currentLocation, vehicle: s.vehicle });
        updated = true;
      }
    } else if (s.status === 'In Transit - Road') {
      s.pathIndex = s.pathIndex + 1;
      const route = s.isDeviated ? ROAD_ROUTE_DEVIATION : ROAD_ROUTE;
      if (s.pathIndex >= route.length) {
        s.status = 'Pending Delivery';
        s.currentLocation = route[route.length - 1];
        s.pathIndex = route.length - 1;

        const alert = {
          id: 'A-' + Math.random().toString(36).substr(2, 9),
          shipmentId: s.id,
          type: 'delivery_pending',
          title: 'Awaiting Scan',
          message: `Shipment ${s.id} has reached destination warehouse. Awaiting QR scan delivery confirmation.`,
          timestamp: new Date().toISOString(),
          severity: 'success',
        };
        db.alerts.unshift(alert);
        io.emit('new_alert', alert);
        io.emit('shipment_update', s);
        updated = true;
      } else {
        s.currentLocation = route[s.pathIndex];
        io.emit('gps_update', { id: s.id, currentLocation: s.currentLocation, vehicle: s.vehicle });
        updated = true;
      }
    }
    return s;
  });

  if (updated) {
    saveDB(db);
  }
}, 4000); // update coordinate every 4 seconds

// Socket connection
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`CargoChain backend listening on port ${PORT}`);
});
