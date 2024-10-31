import express, { RequestHandler } from 'express';
import { UserLogsController } from '../controllers/user-logs.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const userLogsController = new UserLogsController();

router.get('/stats', authMiddleware as RequestHandler, userLogsController.getUserStats as RequestHandler);
router.get('/', authMiddleware as RequestHandler, userLogsController.getUserLogs as RequestHandler);

export default router; 