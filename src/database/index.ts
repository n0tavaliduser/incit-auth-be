import { Sequelize } from 'sequelize';
import config from '../config/database';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
  },
  logging: false
});

export default sequelize; 