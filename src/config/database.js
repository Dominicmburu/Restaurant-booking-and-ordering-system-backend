const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

let prisma;

try {
  prisma = new PrismaClient();
  logger.info('Prisma client initialized');
} catch (error) {
  logger.error(`Error initializing Prisma client: ${error.message}`);
  process.exit(1);
}

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully 🚀');
    
    const databaseUrl = process.env.DATABASE_URL || 'URL not available';
    const dbName = databaseUrl.split('/').pop().split('?')[0];
    logger.info(`Connected to database: ${dbName}`);
    
    return prisma;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    logger.info('Attempting to reconnect in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down Prisma client gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Prisma client gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma, connectDB };