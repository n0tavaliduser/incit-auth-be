import express, { Request, Response, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validatePassword } from '../middleware/passwordValidation';
import { AuthRequest } from '../types/auth';

const router = express.Router();
const authController = new AuthController();

// Type assertion helper
const handleAuth = (fn: (req: AuthRequest, res: Response) => Promise<any>): RequestHandler => 
  (req, res, next) => {
    const authReq = req as AuthRequest;
    return fn(authReq, res).catch(next);
  };

// Basic auth routes
router.post('/register', validatePassword, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/validate', authMiddleware, handleAuth(authController.validateToken));

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authMiddleware, handleAuth(authController.resendVerification));
router.get('/check-verification', authMiddleware, handleAuth(authController.checkVerification));

// OAuth routes
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    return await authController.googleAuth(req, res);
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ error: 'Invalid OAuth token' });
  }
});

router.post('/facebook', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    return await authController.facebookAuth(req, res);
  } catch (error) {
    console.error('Facebook auth error:', error);
    return res.status(401).json({ error: 'Invalid OAuth token' });
  }
});

export default router; 