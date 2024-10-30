import { Request, Response, NextFunction } from 'express';

export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasLength = password.length >= 8;

  if (!hasLower || !hasUpper || !hasDigit || !hasSpecial || !hasLength) {
    return res.status(400).json({
      message: 'Password does not meet requirements',
      validation: {
        hasLower,
        hasUpper,
        hasDigit,
        hasSpecial,
        hasLength
      }
    });
  }

  next();
}; 