import { Router } from 'express';
import { UlipController } from '../controllers/ulip.controller';

const router = Router();

router.get('/fois', UlipController.getFoisFeed);
router.get('/fastag', UlipController.getFastagFeed);
router.get('/pcs1x', UlipController.getPcs1xFeed);

export default router;
