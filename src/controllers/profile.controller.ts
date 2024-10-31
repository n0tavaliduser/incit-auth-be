import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/user.model';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          provider: user.provider,
          picture: user.picture
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { name } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid name provided' });
      }

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ name: name.trim() });

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          provider: user.provider,
          picture: user.picture
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }
} 