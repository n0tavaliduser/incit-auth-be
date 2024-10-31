import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { AuthLog, AuthLogAttributes } from '../models/auth-log.model';
import { Op } from 'sequelize';

interface UserWithLogs extends User {
  AuthLogs?: AuthLogAttributes[];
}

interface UserStats {
  id: number;
  name: string;
  email: string;
  provider: string;
  signUpDate: Date;
  loginCount: number;
  lastLogout: Date | null;
}

export class UserLogsController {
  async getUserLogs(req: Request, res: Response) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'provider', 'createdAt'],
        include: [
          {
            model: AuthLog,
            attributes: ['action', 'created_at'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      }) as UserWithLogs[];

      const userStats: UserStats[] = users.map(user => {
        const logs: AuthLogAttributes[] = (user.AuthLogs || []) as AuthLogAttributes[];
        
        const loginCount = logs.filter(log => log.action === 'login').length;
        const lastLogout = logs
          .filter(log => log.action === 'logout')
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]?.created_at;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          signUpDate: user.createdAt,
          loginCount,
          lastLogout: lastLogout || null
        };
      });

      return res.json(userStats);
    } catch (error) {
      console.error('Get user logs error:', error);
      return res.status(500).json({ error: 'Failed to get user logs' });
    }
  }
} 