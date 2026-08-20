import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/ping', TrackingController.pushTrackingPing);
router.get('/shipments/:shipmentId/events', TrackingController.getShipmentEvents);
router.get('/alerts', TrackingController.getAlerts);
router.post('/alerts/:alertId/ack', TrackingController.acknowledgeAlert);

export default router;
