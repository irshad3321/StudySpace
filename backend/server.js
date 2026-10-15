import app from './src/app.js';
import { config } from './src/config/environment.js';

const PORT = config.port;

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`StudySpace Backend Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Allowed CORS origin: ${config.frontendUrl}`);
});
