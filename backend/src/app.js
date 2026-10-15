import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import apiRoutes from './routes/api.routes.js';
import authRoutes from './routes/auth.routes.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Initialize Express application
const app = express();

// Configure CORS for frontend development origin
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the StudySpace API'
  });
});

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Catch-all 404 Not Found handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
