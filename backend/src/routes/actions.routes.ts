import { Router } from 'express';
import { ActionsController } from '../controllers/actions.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/execute', authenticateJwt, ActionsController.executeAction);

export default router;
