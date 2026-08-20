import { Router } from 'express';
import { PredictionsController } from '../controllers/predictions.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/shipments/:id/predict', authenticateJwt, PredictionsController.triggerPredictionForShipment);
router.get('/legs/:legId', authenticateJwt, PredictionsController.getLegPrediction);

export default router;
