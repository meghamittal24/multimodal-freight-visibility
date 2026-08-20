import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/impact', AnalyticsController.getImpactMetrics);
router.post('/reset-demo', AnalyticsController.resetDemoState);

export default router;
