import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { AuthLog } from '../models/auth-log.model';
import { Op, fn, col, literal } from 'sequelize';

interface UserWithLogs extends User {
  AuthLogs?: AuthLog[];
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

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  avgLast7Days: number;
}

export class UserLogsController {
  async getUserStats(req: Request, res: Response) {
    try {
      // Total users
      const totalUsers = await User.count();

      // Active users today (users who have logged in today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeToday = await AuthLog.count({
        where: {
          action: 'login',
          created_at: {
            [Op.gte]: today
          }
        },
        distinct: true,
        col: 'user_id'
      });

      // Average active users in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const last7DaysActive = await AuthLog.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', literal('DISTINCT user_id')), 'count']
        ],
        where: {
          action: 'login',
          created_at: {
            [Op.gte]: sevenDaysAgo
          }
        },
        group: [fn('DATE', col('created_at'))],
        raw: true
      });

      const avgLast7Days = last7DaysActive.reduce((acc: number, curr: any) => 
        acc + parseInt(curr.count), 0) / 7;

      const stats: DashboardStats = {
        totalUsers,
        activeToday,
        avgLast7Days: Math.round(avgLast7Days)
      };

      return res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      return res.status(500).json({ error: 'Failed to get user statistics' });
    }
  }

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
        const logs = user.AuthLogs || [];
        
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