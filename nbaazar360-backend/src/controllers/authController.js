const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { sendSuccess, sendError, sendValidationError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { notifyAdminNewVendor } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Vendor Signup
 * POST /api/auth/vendor-signup
 */
const vendorSignup = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    business_name,
    business_description,
    phone,
    business_type,
    about,
    contact_info,
    terms_accepted
  } = req.body;

  // Validate email format - requires: user@domain.tld (at least 2 letter TLD)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return sendValidationError(res, [{ field: 'email', message: 'Adresa email nuk është e vlefshme' }]);
  }

  // Check if email already exists
  const emailExists = await User.emailExists(email);
  if (emailExists) {
    return sendValidationError(res, [{ field: 'email', message: 'Ky email është i regjistruar tashmë' }]);
  }

  // Check if business name already exists
  const businessNameExists = await User.businessNameExists(business_name);
  if (businessNameExists) {
    return sendValidationError(res, [{ field: 'business_name', message: 'Ky emër biznesi është i regjistruar tashmë' }]);
  }

  // Auto-generate username from email
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  let username = baseUsername;
  let counter = 1;
  while (await User.usernameExists(username)) {
    username = `${baseUsername}_${counter}`;
    counter++;
  }

  // Handle file uploads - files are saved locally by multer
  let idDocumentUrl = null;
  let stallPhotoUrl = null;

  if (req.files) {
    // ID document - already saved to uploads/documents/ by multer
    if (req.files.id_document && req.files.id_document[0]) {
      idDocumentUrl = `/uploads/documents/${req.files.id_document[0].filename}`;
      logger.info('ID document saved', { path: idDocumentUrl });
    }

    // Stall photo (optional) - already saved to uploads/documents/ by multer
    if (req.files.stall_photo && req.files.stall_photo[0]) {
      stallPhotoUrl = `/uploads/documents/${req.files.stall_photo[0].filename}`;
      logger.info('Stall photo saved', { path: stallPhotoUrl });
    }
  }

  // Create vendor user
  const userData = {
    email,
    username,
    password,
    business_name,
    business_description: business_description || null,
    phone: phone || null,
    business_type: business_type || null,
    about: about || null,
    contact_info: contact_info || null,
    terms_accepted: terms_accepted === 'true' || terms_accepted === true,
    id_document_url: idDocumentUrl,
    stall_photo_url: stallPhotoUrl,
    role: 'vendor',
    status: 'pending'
  };

  const vendor = await User.create(userData);

  // Notify admin of new vendor application
  try {
    console.log('[VENDOR REGISTRATION] About to send admin notification email for:', business_name);
    console.log('[VENDOR REGISTRATION] ADMIN_EMAIL_NOTIFICATIONS =', process.env.ADMIN_EMAIL_NOTIFICATIONS);
    console.log('[VENDOR REGISTRATION] SMTP_USER =', process.env.SMTP_USER || 'NOT SET');
    console.log('[VENDOR REGISTRATION] ADMIN_EMAIL =', process.env.ADMIN_EMAIL || 'NOT SET');

    await notifyAdminNewVendor({
      email,
      business_name,
      business_type: business_type || 'N/A',
      phone
    });

    console.log('[VENDOR REGISTRATION] Admin notification email sent successfully for:', business_name);
  } catch (emailError) {
    console.error('[VENDOR REGISTRATION] Admin notification email FAILED:', emailError.message);
    logger.warn('Admin notification failed', { error: emailError.message });
  }

  logger.info('New vendor signup', { email, business_name });

  return sendSuccess(res, {
    business_name: vendor.business_name,
    status: vendor.status
  }, 'Regjistrimi u krye me sukses! Do të njoftoheni me email kur llogaria juaj të shqyrtohet.', 201);
});

/**
 * Login
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return sendError(res, 'Ky email nuk është i regjistruar', 'USER_NOT_FOUND', 404);
  }

  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return sendError(res, 'Fjalëkalimi është i gabuar', 'WRONG_PASSWORD', 401);
  }

  // Check if user is active (vendors need to be approved)
  if (user.role === 'vendor' && user.status !== 'active') {
    if (user.status === 'pending') {
      return sendError(res, 'Llogaria juaj nuk është aprovuar ende. Ju lutem prisni miratimin nga administratori.', 'ACCOUNT_PENDING', 403);
    }
    if (user.status === 'rejected') {
      return sendError(res, 'Llogaria juaj është refuzuar. Kontaktoni administratorin për më shumë informacion.', 'ACCOUNT_REJECTED', 403);
    }
    if (user.status === 'suspended') {
      return sendError(res, 'Llogaria juaj është pezulluar. Kontaktoni administratorin.', 'ACCOUNT_SUSPENDED', 403);
    }
    return sendError(res, 'Llogaria juaj nuk është aktive', 'ACCOUNT_INACTIVE', 403);
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info('User login', { userId: user.id, business_name: user.business_name });

  return sendSuccess(res, {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      business_name: user.business_name
    }
  }, 'U hytë me sukses!');
});

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless, so we just acknowledge logout
  // In a more complex system, you might blacklist the token
  return sendSuccess(res, null, 'U dolët me sukses!');
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'Përdoruesi nuk u gjet', 'NOT_FOUND', 404);
  }

  // Don't send password hash
  const { password_hash, ...userData } = user;

  return sendSuccess(res, userData);
});

/**
 * Refresh token
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return sendError(res, 'Tokeni është i nevojshëm', 'INVALID_TOKEN', 400);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Tokeni është i pavlefshëm', 'INVALID_TOKEN', 401);
  }

  // Check if user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    return sendError(res, 'Përdoruesi nuk u gjet', 'NOT_FOUND', 404);
  }

  if (user.role === 'vendor' && user.status !== 'active') {
    return sendError(res, 'Llogaria nuk është aktive', 'AUTH_FAILED', 401);
  }

  // Generate new access token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status
  };

  const newToken = generateToken(tokenPayload);

  return sendSuccess(res, { token: newToken }, 'Tokeni u rifreskua me sukses');
});

/**
 * Check username availability
 * POST /api/auth/check-username
 */
const checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;

  const exists = await User.usernameExists(username);

  return sendSuccess(res, { available: !exists });
});

module.exports = {
  vendorSignup,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  checkUsername
};
