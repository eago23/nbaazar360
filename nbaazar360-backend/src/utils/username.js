const { USERNAME } = require('../config/constants');

/**
 * Albanian character mapping for transliteration
 */
const albanianChars = {
  'ë': 'e',
  'Ë': 'e',
  'ç': 'c',
  'Ç': 'c'
};

/**
 * Generate username from business name
 * "Traditional Pottery" -> "traditional_pottery"
 * @param {string} businessName - Business name
 * @returns {string} Generated username
 */
const generateUsername = (businessName) => {
  if (!businessName) return '';

  let username = businessName.toLowerCase();

  // Replace Albanian characters
  Object.keys(albanianChars).forEach((char) => {
    username = username.replace(new RegExp(char, 'g'), albanianChars[char]);
  });

  // Remove accented characters
  username = username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace spaces with underscores
  username = username.replace(/\s+/g, '_');

  // Remove all characters except lowercase letters, numbers, underscores
  username = username.replace(/[^a-z0-9_]/g, '');

  // Replace multiple underscores with single underscore
  username = username.replace(/_+/g, '_');

  // Remove leading/trailing underscores
  username = username.replace(/^_+|_+$/g, '');

  // Truncate to max length
  return username.substring(0, USERNAME.MAX_LENGTH);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
const validateUsernameFormat = (username) => {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < USERNAME.MIN_LENGTH) {
    return {
      valid: false,
      error: `Username must be at least ${USERNAME.MIN_LENGTH} characters`
    };
  }

  if (username.length > USERNAME.MAX_LENGTH) {
    return {
      valid: false,
      error: `Username must be at most ${USERNAME.MAX_LENGTH} characters`
    };
  }

  if (!USERNAME.PATTERN.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain lowercase letters, numbers, and underscores'
    };
  }

  return { valid: true, error: null };
};

/**
 * Suggest alternative usernames if taken
 * @param {string} baseUsername - Base username
 * @param {Function} checkExists - Async function to check if username exists
 * @returns {Array<string>} Array of available username suggestions
 */
const suggestUsernames = async (baseUsername, checkExists) => {
  const suggestions = [];
  const suffixes = ['shop', 'store', 'craft', 'art', 'tirana', 'al'];

  // Try with numbers
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${baseUsername}_${i}`.substring(0, USERNAME.MAX_LENGTH);
    const exists = await checkExists(suggestion);
    if (!exists && suggestions.length < 3) {
      suggestions.push(suggestion);
    }
  }

  // Try with common suffixes
  for (const suffix of suffixes) {
    if (suggestions.length >= 3) break;

    const suggestion = `${baseUsername}_${suffix}`.substring(0, USERNAME.MAX_LENGTH);
    const exists = await checkExists(suggestion);
    if (!exists) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 3);
};

/**
 * Generate unique username
 * @param {string} businessName - Business name
 * @param {Function} checkExists - Async function to check if username exists
 * @returns {string} Unique username
 */
const generateUniqueUsername = async (businessName, checkExists) => {
  let baseUsername = generateUsername(businessName);

  if (!baseUsername || baseUsername.length < USERNAME.MIN_LENGTH) {
    baseUsername = 'vendor';
  }

  let username = baseUsername;
  let counter = 1;

  while (await checkExists(username)) {
    username = `${baseUsername}_${counter}`.substring(0, USERNAME.MAX_LENGTH);
    counter++;

    // Safety limit
    if (counter > 1000) {
      username = `${baseUsername}_${Date.now() % 10000}`;
      break;
    }
  }

  return username;
};

module.exports = {
  generateUsername,
  validateUsernameFormat,
  suggestUsernames,
  generateUniqueUsername
};
