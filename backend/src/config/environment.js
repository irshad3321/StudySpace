import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyspace',
  jwtSecret: process.env.JWT_SECRET || 'studyspace_dev_secret_key_2026_jwt_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
