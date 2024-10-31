import { Dialect, Sequelize } from 'sequelize';

const config = {
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  dialect: (process.env.DB_DRIVER as Dialect) || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
  }
};

// Buat connection string dari config
const DATABASE_URL = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
  },
  logging: false
});

export default config; 