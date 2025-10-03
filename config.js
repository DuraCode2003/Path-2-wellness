const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define configuration object
const config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appName: process.env.APP_NAME || 'Path2Wellness API',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Database
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/path2wellness',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    cookieExpires: process.env.JWT_COOKIE_EXPIRES || 30, // days
  },
  
  // Email
  email: {
    from: process.env.EMAIL_FROM || 'noreply@path2wellness.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Path2Wellness',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || 'your_sendgrid_api_key',
      },
    },
  },
  
  // File uploads
  uploads: {
    directory: process.env.UPLOAD_DIRECTORY || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || 'logs',
  },
  
  // CORS
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    },
  },
};

// Validate required environment variables
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
  logger.error(errorMessage);
  
  // Only throw error in production or if explicitly configured
  if (process.env.NODE_ENV === 'production' || process.env.FAIL_ON_MISSING_CONFIG === 'true') {
    throw new Error(errorMessage);
  } else {
    logger.warn('Running with missing environment variables. Some features may not work correctly.');
  }
}

// Export configuration
module.exports = config;
