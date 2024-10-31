import { Sequelize } from 'sequelize';
import { config } from './index';

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port,
    logging: false,
  }
); 