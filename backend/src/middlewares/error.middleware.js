import { config } from '../config/environment.js';

/**
 * Centralized error handling middleware
 * @param {Error & { statusCode?: number }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = config.nodeEnv === 'development';

  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  // Avoid exposing stack traces in production; provide in development
  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
