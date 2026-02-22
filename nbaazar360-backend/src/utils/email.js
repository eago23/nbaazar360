const nodemailer = require('nodemailer');
const logger = require('./logger');

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Create transporter only if email is configured
let transporter = null;

const initTransporter = () => {
  if (isEmailConfigured() && !transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send email
 * @param {Object} mailOptions - Nodemailer mail options
 * @returns {boolean} Success status
 */
const sendEmail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    logger.info(`[EMAIL SKIPPED] Would send to: ${mailOptions.to}`, {
      subject: mailOptions.subject
    });
    return true;
  }

  try {
    const trans = initTransporter();
    await trans.sendMail(mailOptions);
    logger.info(`Email sent to ${mailOptions.to}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed', { error: error.message, to: mailOptions.to });
    return false;
  }
};

/**
 * Send vendor approval email
 * @param {Object} vendor - Vendor data
 */
const sendVendorApprovalEmail = async (vendor) => {
  if (process.env.VENDOR_EMAIL_NOTIFICATIONS !== 'true') {
    logger.info(`[EMAIL SKIPPED] Approval email for ${vendor.email}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
    to: vendor.email,
    subject: 'Aplikimi juaj u miratua! / Your application was approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>n'Bazaar360</h1>
          </div>
          <div class="content">
            <h2>Përshëndetje ${vendor.full_name},</h2>
            <p>Aplikimi juaj për n'Bazaar360 u miratua!</p>
            <p>Tani mund të hyni në llogarinë tuaj dhe të filloni të menaxhoni profilin dhe historitë tuaja.</p>
            <p><strong>Emri i përdoruesit:</strong> @${vendor.username}</p>
            <p><strong>Email:</strong> ${vendor.email}</p>
            <a href="${FRONTEND_URL}/login" class="button">Hyr në Llogari</a>

            <hr>

            <h2>Hello ${vendor.full_name},</h2>
            <p>Your application for n'Bazaar360 has been approved!</p>
            <p>You can now login to your account and start managing your profile and stories.</p>
            <p><strong>Username:</strong> @${vendor.username}</p>
            <p><strong>Email:</strong> ${vendor.email}</p>
            <a href="${FRONTEND_URL}/login" class="button">Login to Account</a>
          </div>
          <div class="footer">
            <p>Faleminderit / Thank you</p>
            <p>Bashkia e Tiranës / Tirana Municipality</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await sendEmail(mailOptions);
};

/**
 * Send vendor rejection email
 * @param {Object} vendor - Vendor data
 * @param {string} reason - Rejection reason
 */
const sendVendorRejectionEmail = async (vendor, reason) => {
  if (process.env.VENDOR_EMAIL_NOTIFICATIONS !== 'true') {
    logger.info(`[EMAIL SKIPPED] Rejection email for ${vendor.email}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
    to: vendor.email,
    subject: 'Aplikimi juaj u refuzua / Your application was rejected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .reason { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>n'Bazaar360</h1>
          </div>
          <div class="content">
            <h2>Përshëndetje ${vendor.full_name},</h2>
            <p>Na vjen keq, por aplikimi juaj për n'Bazaar360 u refuzua.</p>
            <div class="reason">
              <strong>Arsyeja:</strong><br>
              ${reason}
            </div>
            <p>Ju mund të aplikoni përsëri me informacion të saktë.</p>

            <hr>

            <h2>Hello ${vendor.full_name},</h2>
            <p>We're sorry, but your application for n'Bazaar360 has been rejected.</p>
            <div class="reason">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            <p>You may reapply with correct information.</p>
          </div>
          <div class="footer">
            <p>Bashkia e Tiranës / Tirana Municipality</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await sendEmail(mailOptions);
};

/**
 * Notify admin of new vendor application
 * @param {Object} vendor - Vendor data
 */
const notifyAdminNewVendor = async (vendor) => {
  if (process.env.ADMIN_EMAIL_NOTIFICATIONS !== 'true') {
    logger.info(`[EMAIL SKIPPED] Admin notification for new vendor: ${vendor.business_name}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
    to: process.env.ADMIN_EMAIL || 'admin@bashkiatirana.gov.al',
    subject: `Aplikim i ri vendor: ${vendor.business_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .info p { margin: 5px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Aplikim i ri vendor</h1>
          </div>
          <div class="content">
            <p>Një aplikim i ri vendor është dërguar në n'Bazaar360.</p>
            <div class="info">
              <p><strong>Emri i biznesit:</strong> ${vendor.business_name}</p>
              <p><strong>Emri i plotë:</strong> ${vendor.full_name}</p>
              <p><strong>Email:</strong> ${vendor.email}</p>
              <p><strong>Username:</strong> @${vendor.username}</p>
              <p><strong>Telefon:</strong> ${vendor.phone || 'N/A'}</p>
              <p><strong>Lloji:</strong> ${vendor.business_type}</p>
              <p><strong>Adresa:</strong> ${vendor.address || 'N/A'}</p>
            </div>
            <a href="${FRONTEND_URL}/admin/vendors/pending" class="button">Shiko Aplikimin</a>
          </div>
          <div class="footer">
            <p>n'Bazaar360 Admin System</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await sendEmail(mailOptions);
};

module.exports = {
  isEmailConfigured,
  sendEmail,
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  notifyAdminNewVendor
};
