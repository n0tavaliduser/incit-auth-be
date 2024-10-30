import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { emailService } from '../services/emailService';
import { User, UserEmailData } from '../types/user';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  password: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires_at: Date | null;
  oauth_provider?: string;
}

/**
 * Generates a random token for email verification
 */
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Handles user registration
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (
        email, 
        password, 
        name, 
        verification_token, 
        verification_token_expires_at,
        email_verified,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, false, NOW(), NOW())`,
      [email, hashedPassword, name, verificationToken, tokenExpires]
    );

    const user: User = {
      id: result.insertId,
      email,
      name,
      password: hashedPassword,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    // Generate initial JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        email_verified: false 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: false
      }
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering user' 
    });
    return;
  }
};

/**
 * Handles email verification
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    console.log('Verifying token:', token);

    // First, get the user with this token
    const [users] = await pool.execute<UserRow[]>(
      `SELECT * FROM users WHERE verification_token = ? AND verification_token_expires_at > NOW()`,
      [token]
    );

    console.log('Found users:', users);

    if (!users.length) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    const user = users[0];

    // Update using string '1' for true
    await pool.execute(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL, 
           verification_token_expires_at = NULL 
       WHERE id = ?`,
      [user.id]
    );

    // Verify the update
    const [updatedUsers] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    );

    const updatedUser = updatedUsers[0];
    console.log('Updated user:', updatedUser);

    const newToken = jwt.sign(
      { 
        id: updatedUser.id, 
        email: updatedUser.email,
        email_verified: updatedUser.email_verified
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true,
      message: 'Email verified successfully',
      token: newToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        email_verified: updatedUser.email_verified
      }
    });
    return;

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying email' 
    });
    return;
  }
};

/**
 * Handles resending verification email
 */
export const resendVerification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    await pool.execute<ResultSetHeader>(
      `UPDATE users SET verification_token = ?, verification_token_expires_at = ? 
       WHERE id = ?`,
      [verificationToken, tokenExpires, userId]
    );

    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE id = ?', 
      [userId]
    );
    const user = users[0];

    const userForEmail: UserEmailData = {
      id: user.id,
      email: user.email,
      name: user.name,
      email_verified: user.email_verified
    };

    await emailService.sendVerificationEmail(userForEmail, verificationToken);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
};

/**
 * Handles user login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    const user = users[0];

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
        oauth_provider: user.oauth_provider
      }
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in' 
    });
    return;
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
    return;
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
    return;
  }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}; 