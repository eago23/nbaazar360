const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Color codes for console output
const COLORS = {
  ERROR: '\x1b[31m',   // Red
  WARN: '\x1b[33m',    // Yellow
  INFO: '\x1b[36m',    // Cyan
  DEBUG: '\x1b[90m',   // Gray
  RESET: '\x1b[0m'     // Reset
};

/**
 * Format timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Write log to file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const writeToFile = (level, message, data = null) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...(data && { data })
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
};

/**
 * Log to console with color
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const logToConsole = (level, message, data = null) => {
  const color = COLORS[level] || COLORS.INFO;
  const timestamp = getTimestamp();

  let output = `${color}[${timestamp}] [${level}]${COLORS.RESET} ${message}`;

  if (data) {
    output += '\n' + JSON.stringify(data, null, 2);
  }

  console.log(output);
};

/**
 * Main log function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const log = (level, message, data = null) => {
  logToConsole(level, message, data);

  // Only write to file in production or for errors
  if (process.env.NODE_ENV === 'production' || level === LOG_LEVELS.ERROR) {
    writeToFile(level, message, data);
  }
};

// Export individual log functions
const error = (message, data = null) => log(LOG_LEVELS.ERROR, message, data);
const warn = (message, data = null) => log(LOG_LEVELS.WARN, message, data);
const info = (message, data = null) => log(LOG_LEVELS.INFO, message, data);
const debug = (message, data = null) => {
  if (process.env.NODE_ENV !== 'production') {
    log(LOG_LEVELS.DEBUG, message, data);
  }
};

// HTTP request logger for morgan
const httpStream = {
  write: (message) => {
    info(message.trim());
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  httpStream,
  LOG_LEVELS
};
