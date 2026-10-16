import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import apiRoutes from './routes/api.routes.js';
import authRoutes from './routes/auth.routes.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Initialize Express application
const app = express();

// Configure CORS for frontend origins with credentials for cookies
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

// Parse incoming cookie headers
app.use(cookieParser());

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
