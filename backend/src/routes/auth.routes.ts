import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authenticateJwt, AuthController.getMe);
router.get('/demo-users', AuthController.getAllDemoUsers);

export default router;
