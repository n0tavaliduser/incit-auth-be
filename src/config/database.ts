import { Dialect, Sequelize } from 'sequelize';

// Konfigurasi dasar
const config = {
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  dialect: (process.env.DB_DRIVER as Dialect) || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Konfigurasi Sequelize
let sequelizeConfig: any = {
  dialect: 'mysql',
  logging: false
};

// Jika menggunakan DATABASE_URL (biasanya di production)
if (process.env.DATABASE_URL) {
  sequelizeConfig = {
    ...sequelizeConfig,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };
}

export const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, sequelizeConfig)
  : new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        ...sequelizeConfig,
        host: config.host,
        port: config.port
      }
    );

export default config; 