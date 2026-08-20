import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import shipmentsRoutes from './routes/shipments.routes';
import predictionsRoutes from './routes/predictions.routes';
import trackingRoutes from './routes/tracking.routes';
import actionsRoutes from './routes/actions.routes';
import corridorsRoutes from './routes/corridors.routes';
import ulipRoutes from './routes/ulip.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Security & Utility Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'unified-freight-visibility-backend',
    version: '1.0.0',
    sih_team: 'Jugaad Junction (SIH 2026)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shipments', shipmentsRoutes);
app.use('/api/v1/predictions', predictionsRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/actions', actionsRoutes);
app.use('/api/v1/corridors', corridorsRoutes);
app.use('/api/v1/ulip', ulipRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// OpenAPI Specification Route
app.get('/api/docs.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Unified Multimodal Freight Visibility Platform REST API',
      version: '1.0.0',
      description: 'API for SIH 2026 Multimodal Freight Visibility & Coordination by Team Jugaad Junction.',
    },
    servers: [{ url: `http://localhost:${config.port}/api/v1` }],
    paths: {
      '/shipments': { get: { summary: 'List multimodal shipments' }, post: { summary: 'Create new shipment' } },
      '/shipments/{id}/timeline': { get: { summary: 'Get multimodal handoff timeline' } },
      '/shipments/{id}/ripple-effect': { get: { summary: 'Get delay propagation graph' } },
      '/predictions/shipments/{id}/predict': { post: { summary: 'Trigger ML delay risk prediction' } },
      '/tracking/ping': { post: { summary: 'Simulate live FOIS/FASTag/PCS1x telemetry ping' } },
      '/actions/execute': { post: { summary: 'Execute HOLD, REROUTE, or RESCHEDULE coordination action' } },
      '/analytics/impact': { get: { summary: 'Get logistics cost & carbon abatement impact metrics' } },
      '/ulip/fois': { get: { summary: 'Simulated CRIS FOIS rail telemetry feed' } },
      '/ulip/fastag': { get: { summary: 'Simulated NPCI NETC FASTag toll feed' } },
      '/ulip/pcs1x': { get: { summary: 'Simulated IPA PCS1x port terminal feed' } },
    },
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(` Unified Multimodal Freight Visibility Platform Backend`);
    console.log(` SIH 2026 - Team Jugaad Junction`);
    console.log(` Server running on: http://localhost:${config.port}`);
    console.log(` OpenAPI Docs at: http://localhost:${config.port}/api/docs.json`);
    console.log(` Connected to ML Service at: ${config.mlServiceUrl}`);
    console.log(`=======================================================`);
  });
}

export default app;
