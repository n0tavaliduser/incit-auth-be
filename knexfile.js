require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'incit_test_db',
      port: process.env.DB_PORT || 3306
    },
    migrations: {
      directory: './database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'js'
    }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'js'
    }
  }
}; 