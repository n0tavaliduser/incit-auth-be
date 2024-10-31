import express, { RequestHandler } from 'express';
import { getDashboardData } from '../controllers/dashboard';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware as RequestHandler, getDashboardData as RequestHandler);

export default router; 