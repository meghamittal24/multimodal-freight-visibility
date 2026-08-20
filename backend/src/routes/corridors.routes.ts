import { Router } from 'express';
import { CorridorsController } from '../controllers/corridors.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.get('/', CorridorsController.listCorridors);
router.get('/:id', CorridorsController.getCorridorById);
router.post('/', authenticateJwt, CorridorsController.createCorridor);

export default router;
