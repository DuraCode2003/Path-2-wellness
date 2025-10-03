const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { httpServer } = require('./app');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down...`);
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
const DB = process.env.MONGODB_URI.replace(
  '<PASSWORD>',
  process.env.MONGODB_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => logger.info('MongoDB connection successful!'))
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const port = process.env.PORT || 5000;
const server = httpServer.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

module.exports = server;
