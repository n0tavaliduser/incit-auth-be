import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import moment from 'moment-timezone';

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const timezone = process.env.APP_TIMEZONE || 'Asia/Jakarta';
    const currentHour = moment().tz(timezone).hour();
    
    let greeting = '';
    if (currentHour >= 3 && currentHour < 12) {
      greeting = 'pagi';
    } else if (currentHour >= 12 && currentHour < 15) {
      greeting = 'siang';
    } else if (currentHour >= 15 && currentHour < 18) {
      greeting = 'sore';
    } else {
      greeting = 'malam';
    }

    const userData = {
      name: req.user?.name,
      greeting: greeting,
      timestamp: moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')
    };

    res.json(userData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
}; 