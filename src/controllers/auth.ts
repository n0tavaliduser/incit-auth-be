import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../types/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}

export async function logout(req: Request, res: Response) {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
} 