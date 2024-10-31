import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { AuthRequest, AuthUser } from '../types/auth';

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 