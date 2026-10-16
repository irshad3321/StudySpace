import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const defaultAtlasUri = 'mongodb+srv://irshadch3321_db_user:StudySpace12345@studyspacecluster.omoamrg.mongodb.net/studyspace?retryWrites=true&w=majority';

const getMongoUri = () => {
  const envUri = process.env.MONGODB_URI;
  if (!envUri || envUri.includes('127.0.0.1') || envUri.includes('localhost') || envUri.includes('cluster0.e2wt3g2')) {
    return defaultAtlasUri;
  }
  return envUri;
};

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'https://studyspace-zeta.vercel.app',
  mongodbUri: getMongoUri(),
  jwtSecret: process.env.JWT_SECRET || 'studyspace_dev_secret_key_2026_jwt_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
