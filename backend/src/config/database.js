import mongoose from 'mongoose';
import { config } from './environment.js';

let cachedPromise = null;
export let lastConnectionError = null;

/**
 * Connect to MongoDB using Mongoose (cached for serverless/Vercel environments)
 */
export const connectDB = async () => {
  // If connection is already established, reuse it
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If already connecting, await the existing promise
  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 8000
    });

    const conn = await cachedPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null; // Reset promise so next request can retry
    lastConnectionError = error.message;
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};
