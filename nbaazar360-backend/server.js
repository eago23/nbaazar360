// Load environment variables first
require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const recommended = ['JWT_SECRET', 'CORS_ORIGIN', 'FRONTEND_URL'];
  const missing = [];
  const warnings = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  recommended.forEach(key => {
    if (!process.env[key]) {
      warnings.push(key);
    }
  });

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.info('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn(`Missing recommended environment variables: ${warnings.join(', ')}`);
  }

  // Security warning for default JWT secret
  if (process.env.JWT_SECRET === 'nbaazar360-default-secret' || !process.env.JWT_SECRET) {
    logger.warn('Using default JWT_SECRET. Please set a strong secret in production!');
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Test database connection
    logger.info('Connecting to database...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database. Server will start but database operations will fail.');
      logger.info('Make sure MySQL is running and the database configuration is correct.');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     n'Bazaar360 Backend Server                            ║
║                                                           ║
║     Status: Running                                       ║
║     Port: ${PORT}                                            ║
║     Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                           ║
║     API Health: http://localhost:${PORT}/api/health           ║
║     API Base: http://localhost:${PORT}/api                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);

      // Log configuration status
      logger.info('Configuration Status:');
      logger.info(`  Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
      logger.info(`  File Storage: ✅ Local (uploads/ folder)`);
      logger.info(`  CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      logger.info(`  Admin Email Notifications: ${process.env.ADMIN_EMAIL_NOTIFICATIONS === 'true' ? '✅ Enabled' : '⚠️ Disabled'}`);
      logger.info(`  Vendor Email Notifications: ${process.env.VENDOR_EMAIL_NOTIFICATIONS === 'true' ? '✅ Enabled' : '⚠️ Disabled'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
