import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

/**
 * Serverless function handler for Vercel
 */
export default async function handler(req, res) {
  try {
    // Ensure MongoDB is connected before handling requests
    await connectDB();
  } catch (error) {
    console.error('Database connection failed in serverless handler:', error.message);
    // Return friendly error if not health check
    if (!req.url.includes('/health')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please ensure MONGODB_URI is set correctly in Vercel environment variables and IP access allows 0.0.0.0/0.',
        error: error.message
      });
    }
  }

  return app(req, res);
}
