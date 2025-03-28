const app = require('./app');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');
const { connectDB } = require('./config/database');
const { testStripeConnection } = require('./config/stripe');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// Fix the memory leak warning by increasing max listeners
process.setMaxListeners(20);

// Start server with all necessary connections
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Test Stripe connection
    await testStripeConnection();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();