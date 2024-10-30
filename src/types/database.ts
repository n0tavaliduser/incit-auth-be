import { RowDataPacket } from 'mysql2';
import { User } from './user';

export interface UserRow extends RowDataPacket, Omit<User, 'email_verified'> {
  email_verified: string;
} 