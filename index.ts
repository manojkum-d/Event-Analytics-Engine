import app from './app.js';
import { connectDb } from './src/shared/config/dbConfig.js';
import { envConfig } from './src/shared/config/envConfig.js';

const PORT = envConfig.port;
// Function to start the server
const startServer = async () => {
  try {
    // Initialize database connections
    await connectDb();
    console.info('Connected to the database successfully.');

    // Start the Express server
    app.listen(PORT, () => {
      console.info(`Backend server is running on ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // Exit the process if initialization fails
  }
};

// Start the server
startServer();
