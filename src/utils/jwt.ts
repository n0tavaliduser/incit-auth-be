import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    config.jwt.secret,
    {
      expiresIn: '24h',
    }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 