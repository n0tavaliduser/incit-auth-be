import express, { RequestHandler } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';
import { validateChangePassword } from '../middleware/passwordValidation';

const router = express.Router();
const profileController = new ProfileController();

router.get('/', authMiddleware as RequestHandler, profileController.getProfile as RequestHandler);
router.put('/update', authMiddleware as RequestHandler, profileController.updateProfile as RequestHandler);
router.put('/change-password', [authMiddleware as RequestHandler, validateChangePassword], profileController.changePassword as RequestHandler);

export default router; 