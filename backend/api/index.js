import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

/**
 * Serverless function handler for Vercel
 */
export default async function handler(req, res) {
  // Ensure MongoDB is connected before handling request
  await connectDB();
  return app(req, res);
}
