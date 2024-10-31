import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validatePassword } from '../middleware/passwordValidation';
import { AuthRequest } from '../types/auth';

const router = express.Router();
const authController = new AuthController();

// Updated type assertion helper
const handleAuth = (
  fn: (req: AuthRequest, res: Response) => Promise<any>
): RequestHandler => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Explicitly cast the request to include user property
      const authReq = req as unknown as AuthRequest;
      await fn(authReq, res);
    } catch (error) {
      next(error);
    }
  };

// Basic auth routes
router.post('/register', validatePassword, authController.register as RequestHandler);
router.post('/login', authController.login as RequestHandler);
router.post('/logout', authController.logout as RequestHandler);
router.get('/validate', 
  authMiddleware as RequestHandler,
  handleAuth(authController.validateToken)
);

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail as RequestHandler);
router.post('/resend-verification',
  authMiddleware as RequestHandler,
  handleAuth(authController.resendVerification)
);
router.get('/check-verification',
  authMiddleware as RequestHandler,
  handleAuth(authController.checkVerification)
);

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

// Add these routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', validatePassword, authController.resetPassword);

export default router; 