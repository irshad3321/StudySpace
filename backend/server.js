import app from './src/app.js';
import { config } from './src/config/environment.js';
import { connectDB } from './src/config/database.js';

const PORT = config.port;

// Connect to MongoDB and start HTTP server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`StudySpace Backend Server running on port ${PORT} in ${config.nodeEnv} mode`);
    console.log(`Allowed CORS origin: ${config.frontendUrl}`);
  });
};

startServer();
