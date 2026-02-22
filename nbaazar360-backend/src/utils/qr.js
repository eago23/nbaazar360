const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Ensure QR codes directory exists
const qrCodesDir = path.join(process.cwd(), 'uploads', 'qrcodes');
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

/**
 * Generate QR code data URL
 * @param {string} url - URL to encode
 * @param {Object} options - QR code options
 * @returns {string} Data URL of QR code image
 */
const generateQRCodeDataURL = async (url, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  return await QRCode.toDataURL(url, { ...defaultOptions, ...options });
};

/**
 * Generate QR code buffer (for direct download)
 * @param {string} url - URL to encode
 * @param {Object} options - QR code options
 * @returns {Buffer} PNG buffer
 */
const generateQRCodeBuffer = async (url, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  return await QRCode.toBuffer(url, { ...defaultOptions, ...options });
};

/**
 * Generate story URL
 * @param {string} storySlug - Story slug
 * @returns {string} Full story URL
 */
const getStoryUrl = (storySlug) => {
  return `${FRONTEND_URL}/stories/${storySlug}`;
};

/**
 * Generate QR code image for a story and save locally
 * @param {string} storySlug - Story slug for URL
 * @param {number} storyId - Story ID for filename
 * @returns {Object} { qrCodeUrl, storyUrl }
 */
const generateStoryQRCode = async (storySlug, storyId) => {
  try {
    // Generate story URL
    const storyUrl = getStoryUrl(storySlug);

    // Generate QR code as buffer
    const qrBuffer = await generateQRCodeBuffer(storyUrl, {
      width: 400, // Higher quality for printing
      margin: 3
    });

    // Save to local file
    const filename = `story_${storyId}_qr.png`;
    const filePath = path.join(qrCodesDir, filename);
    fs.writeFileSync(filePath, qrBuffer);

    const qrCodeUrl = `/uploads/qrcodes/${filename}`;

    console.log('QR code saved:', qrCodeUrl);

    return {
      qrCodeUrl,
      storyUrl
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate vendor profile QR code and save locally
 * @param {string} username - Vendor username
 * @param {number} vendorId - Vendor ID for filename
 * @returns {Object} { qrCodeUrl, profileUrl }
 */
const generateVendorQRCode = async (username, vendorId) => {
  try {
    const profileUrl = `${FRONTEND_URL}/vendors/${username}`;

    // Generate QR code as buffer
    const qrBuffer = await generateQRCodeBuffer(profileUrl, {
      width: 400,
      margin: 3
    });

    // Save to local file
    const filename = `vendor_${vendorId}_qr.png`;
    const filePath = path.join(qrCodesDir, filename);
    fs.writeFileSync(filePath, qrBuffer);

    const qrCodeUrl = `/uploads/qrcodes/${filename}`;

    console.log('Vendor QR code saved:', qrCodeUrl);

    return {
      qrCodeUrl,
      profileUrl
    };
  } catch (error) {
    console.error('Vendor QR code generation error:', error);
    throw new Error('Failed to generate vendor QR code');
  }
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeBuffer,
  getStoryUrl,
  generateStoryQRCode,
  generateVendorQRCode
};
