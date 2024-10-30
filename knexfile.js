require('dotenv').config();
require('ts-node/register');

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      charset: 'utf8mb4'
    },
    migrations: {
      directory: './database/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'ts'
    }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './database/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'ts'
    }
  }
}; 