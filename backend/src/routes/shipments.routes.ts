import { Router } from 'express';
import { ShipmentsController } from '../controllers/shipments.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJwt, ShipmentsController.listShipments);
router.post('/', authenticateJwt, ShipmentsController.createShipment);
router.get('/:id', authenticateJwt, ShipmentsController.getShipmentById);
router.get('/:id/timeline', authenticateJwt, ShipmentsController.getShipmentTimeline);
router.get('/:id/ripple-effect', authenticateJwt, ShipmentsController.getRippleEffect);

export default router;
