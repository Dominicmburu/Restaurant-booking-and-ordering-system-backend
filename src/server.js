const app = require('./app');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');
const { connectDB } = require('./config/database');
const { testStripeConnection } = require('./config/stripe');

dotenv.config();

const PORT = process.env.PORT || 5000;

process.setMaxListeners(20);

const startServer = async () => {
  try {
    await connectDB();
    
    await testStripeConnection();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();