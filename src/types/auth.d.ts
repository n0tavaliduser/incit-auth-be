import { Request } from 'express';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  provider?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
} 