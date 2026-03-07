const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { RATE_LIMITS } = require('./config/constants');

// Create Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable for API
}));

// CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) // Support multiple origins: "url1, url2"
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting
const publicLimiter = rateLimit({
  windowMs: RATE_LIMITS.PUBLIC.windowMs,
  max: RATE_LIMITS.PUBLIC.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// COMPRESSION MIDDLEWARE
// ============================================

// Compress all responses for faster transfer
app.use(compression());

// ============================================
// PARSING MIDDLEWARE
// ============================================

// Parse JSON bodies (increased for large panorama uploads)
app.use(express.json({ limit: '25mb' }));

// Parse URL-encoded bodies (increased for large panorama uploads)
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ============================================
// STATIC FILE SERVING (Local uploads)
// ============================================

// Serve uploaded files from /uploads directory with cache headers
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '1y', // Cache for 1 year (31536000 seconds)
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set cache headers for images and videos
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));
logger.info('Static file serving enabled for /uploads with caching');

// ============================================
// LOGGING MIDDLEWARE
// ============================================

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: logger.httpStream }));
}

// ============================================
// TRUST PROXY (for rate limiting behind reverse proxy)
// ============================================

app.set('trust proxy', 1);

// ============================================
// ROUTES
// ============================================

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/vendor-signup', authLimiter);
app.use('/api', publicLimiter);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Welcome to n'Bazaar360 API",
    version: '1.0.0',
    docs: '/api/health'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
