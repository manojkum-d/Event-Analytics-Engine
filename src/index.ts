import app from './app';
import { connectDb } from './shared/config/dbConfig';
import { envConfig } from './shared/config/envConfig';

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
