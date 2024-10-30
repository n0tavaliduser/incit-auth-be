import express from 'express';
import { login, register, logout, verifyToken } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';
import { validatePassword } from '../middleware/passwordValidation';

const router = express.Router();

router.post('/register', validatePassword, register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', authMiddleware, verifyToken);

export default router; 