import { Request, Response, NextFunction } from 'express';

export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasLength = password.length >= 8;

  if (!hasLower || !hasUpper || !hasDigit || !hasSpecial || !hasLength) {
    res.status(400).json({
      message: 'Password does not meet requirements',
      validation: {
        hasLower,
        hasUpper,
        hasDigit,
        hasSpecial,
        hasLength
      }
    });
    return;
  }

  next();
  return;
}; 