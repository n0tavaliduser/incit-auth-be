import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    name: process.env.APP_NAME || 'incit-auth-be',
    port: parseInt(process.env.PORT || '3001', 10),
    timezone: process.env.TIMEZONE || 'Asia/Jakarta'
  },
  database: {
    driver: process.env.DB_DRIVER || 'mysql2',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'incit_test_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
}; 