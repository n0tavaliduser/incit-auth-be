import express from 'express';
import { login, register, logout, verifyToken } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', authMiddleware, verifyToken);

export default router; 