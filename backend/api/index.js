import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

/**
 * Serverless function handler for Vercel
 */
export default async function handler(req, res) {
  const origin = req.headers.origin || 'https://studyspace-zeta.vercel.app';

  // Always attach CORS headers to all serverless responses (including errors)
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Immediately respond to preflight OPTIONS requests without waiting for database
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure MongoDB is connected before handling requests
    await connectDB();
  } catch (error) {
    console.error('Database connection failed in serverless handler:', error.message);
    // Return friendly error with CORS headers if not health check
    if (!req.url.includes('/health')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please ensure MONGODB_URI is set correctly in Vercel environment variables and MongoDB Atlas Network Access allows 0.0.0.0/0.',
        error: error.message
      });
    }
  }

  return app(req, res);
}
