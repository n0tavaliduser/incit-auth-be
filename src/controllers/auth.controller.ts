import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { config } from '../config';
import { User } from '../models/user.model';
import { generateToken, verifyToken } from '../utils/jwt';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../types/auth';
import crypto from 'crypto';
import { Op } from 'sequelize';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        email_verified: false,
        picture: '',
        provider: 'local'
      });

      const token = generateToken(user);

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          provider: user.provider
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = generateToken(user);
      
      return res.json({ 
        token, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          provider: user.provider
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Logout failed' });
    }
  }

  validateToken = async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      return res.json({ valid: true, user });
    } catch (error) {
      console.error('Token validation error:', error);
      return res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  };

  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { email, name, picture, sub: providerId } = response.data;
      if (!email) {
        return res.status(400).json({ error: 'Email not provided by Google' });
      }

      let user = await User.findOne({ where: { email } });
      
      if (!user) {
        user = await User.create({
          email,
          name: name || email.split('@')[0],
          picture: picture || '',
          email_verified: true,
          provider: 'google',
          providerId: providerId || ''
        });
      }

      const jwtToken = generateToken(user);

      return res.json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (error) {
      console.error('Google auth error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async facebookAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      // Verify token and get user info from Facebook
      const response = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: token
        }
      });

      const { id: providerId, name, email, picture } = response.data;
      if (!email) {
        return res.status(400).json({ error: 'Email not provided by Facebook' });
      }

      let user = await User.findOne({ where: { email } });
      
      if (!user) {
        user = await User.create({
          name,
          email,
          picture: picture?.data?.url || '',
          email_verified: true,
          provider: 'facebook',
          providerId
        });
      } else if (user.provider === 'local' && !user.email_verified) {
        await user.update({
          email_verified: true,
          provider: 'facebook',
          providerId,
          picture: picture?.data?.url || user.picture
        });
      }

      const jwtToken = generateToken(user);

      return res.json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          email_verified: user.email_verified
        }
      });

    } catch (error) {
      console.error('Facebook auth error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const decoded = verifyToken(token);
      const user = await User.findOne({ where: { email: decoded.email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ email_verified: true });

      // Generate new token and return with user data
      const newToken = generateToken(user);
      return res.json({ 
        message: 'Email verified successfully',
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: true,
          provider: user.provider
        }
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
  }

  resendVerification = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { id: userId } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.email_verified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      const verificationToken = generateToken(user);
      await sendVerificationEmail(user.email, verificationToken);

      return res.json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({ error: 'Failed to resend verification email' });
    }
  };

  checkVerification = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { id: userId } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ isVerified: user.email_verified });
    } catch (error) {
      console.error('Check verification error:', error);
      return res.status(500).json({ error: 'Failed to check verification status' });
    }
  };

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Return success even if user not found for security
        return res.json({ message: 'If an account exists, a reset link will be sent to your email' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token to user
      await user.update({
        resetToken,
        resetTokenExpiresAt: resetTokenExpiry
      });

      // Send reset email
      await sendResetPasswordEmail(email, resetToken);

      return res.json({ message: 'If an account exists, a reset link will be sent to your email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user
      await user.update({
        password: hashedPassword,
        resetToken: '',
        resetTokenExpiresAt: undefined
      });

      return res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  }
} 