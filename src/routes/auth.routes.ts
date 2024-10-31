import express, { RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/facebook', authController.facebookAuth);

// Protected routes
router.post('/logout', authMiddleware as RequestHandler, authController.logout as RequestHandler);
router.get('/validate', authMiddleware as RequestHandler, authController.validateToken as RequestHandler);

export default router; 