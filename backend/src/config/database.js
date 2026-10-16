import mongoose from 'mongoose';
import { config } from './environment.js';

let cachedConnection = null;

/**
 * Connect to MongoDB using Mongoose (cached for serverless/Vercel environments)
 */
export const connectDB = async () => {
  // If connection is already open, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      bufferCommands: false, // Disable Mongoose buffering in serverless
      serverSelectionTimeoutMS: 5000
    });
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't throw unhandled error in dev, but propagate for debugging in serverless
  }
};
