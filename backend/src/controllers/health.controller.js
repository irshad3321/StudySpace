import mongoose from 'mongoose';

/**
 * Controller to handle API health check
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getHealthStatus = (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  const isMongoUriConfigured = Boolean(process.env.MONGODB_URI);

  res.status(200).json({
    success: true,
    message: 'StudySpace API is running',
    database: {
      status: dbState,
      isConfigured: isMongoUriConfigured,
      host: mongoose.connection.host || null
    },
    timestamp: new Date().toISOString()
  });
};
