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
  console.log('[EMAIL SERVICE] sendEmail called for:', mailOptions.to, 'Subject:', mailOptions.subject);

  if (!isEmailConfigured()) {
    console.log('[EMAIL SERVICE] SKIPPING - SMTP not configured (SMTP_USER or SMTP_PASS missing)');
    logger.info(`[EMAIL SKIPPED] Would send to: ${mailOptions.to}`, {
      subject: mailOptions.subject
    });
    return true;
  }

  try {
    console.log('[EMAIL SERVICE] Attempting to send email via SMTP...');
    const trans = initTransporter();
    await trans.sendMail(mailOptions);
    console.log('[EMAIL SERVICE] Email sent SUCCESSFULLY to:', mailOptions.to);
    logger.info(`Email sent to ${mailOptions.to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Email sending FAILED:', error.message);
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
    subject: "Aplikimi juaj u aprovua - n'Bazaar360",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: #dc2626; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .header span { color: #ffffff; font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #ffffff; }
          .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 15px; color: #4b5563; margin-bottom: 15px; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { padding: 25px 30px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .signature p { margin: 5px 0; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>n'Bazaar360</h1>
            <span>Pazari i Ri - Tiranë</span>
          </div>
          <div class="content">
            <p class="greeting">I dashur/e <strong>${vendor.business_name}</strong>,</p>

            <p class="message">Ju njoftojmë me kënaqësi se aplikimi juaj për t'u bashkuar me platformën <strong>n'Bazaar360 - Pazari i Ri</strong> është aprovuar!</p>

            <p class="message">Tani mund të hyni në llogarinë tuaj dhe të filloni të menaxhoni profilin tuaj, të ngarkoni histori AR dhe të prezantoni biznesin tuaj për të gjithë vizitorët e Pazarit të Ri.</p>

            <div class="button-container">
              <a href="${FRONTEND_URL}/hyrje" class="button">Hyr në Llogari</a>
            </div>

            <p class="message">Mirë se vini në familjen n'Bazaar360!</p>

            <div class="signature">
              <p>Me respekt,</p>
              <p><strong>Ekipi i n'Bazaar360</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>n'Bazaar360 - Pazari i Ri, Tiranë</p>
            <p>&copy; ${new Date().getFullYear()} Të gjitha të drejtat e rezervuara</p>
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
 * @param {string} reason - Rejection reason (not displayed in email per user request)
 */
const sendVendorRejectionEmail = async (vendor, reason) => {
  console.log('[EMAIL SERVICE] sendVendorRejectionEmail called for:', vendor.email);
  console.log('[EMAIL SERVICE] VENDOR_EMAIL_NOTIFICATIONS =', process.env.VENDOR_EMAIL_NOTIFICATIONS);
  console.log('[EMAIL SERVICE] isEmailConfigured() =', isEmailConfigured());
  console.log('[EMAIL SERVICE] SMTP_USER =', process.env.SMTP_USER || 'NOT SET');

  if (process.env.VENDOR_EMAIL_NOTIFICATIONS !== 'true') {
    console.log('[EMAIL SERVICE] SKIPPING - VENDOR_EMAIL_NOTIFICATIONS is not "true"');
    logger.info(`[EMAIL SKIPPED] Rejection email for ${vendor.email}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
    to: vendor.email,
    subject: "Aplikimi juaj - n'Bazaar360",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: #dc2626; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .header span { color: #ffffff; font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #ffffff; }
          .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 15px; color: #4b5563; margin-bottom: 15px; }
          .footer { padding: 25px 30px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .signature p { margin: 5px 0; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>n'Bazaar360</h1>
            <span>Pazari i Ri - Tiranë</span>
          </div>
          <div class="content">
            <p class="greeting">I dashur/e <strong>${vendor.business_name}</strong>,</p>

            <p class="message">Ju falënderojmë për interesin tuaj për t'u bashkuar me platformën <strong>n'Bazaar360 - Pazari i Ri</strong>.</p>

            <p class="message">Pas shqyrtimit të aplikimit tuaj, me keqardhje ju njoftojmë se nuk mund ta aprovojmë kërkesën tuaj në këtë moment.</p>

            <p class="message">Nëse keni pyetje, mos hezitoni të na kontaktoni.</p>

            <div class="signature">
              <p>Me respekt,</p>
              <p><strong>Ekipi i n'Bazaar360</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>n'Bazaar360 - Pazari i Ri, Tiranë</p>
            <p>&copy; ${new Date().getFullYear()} Të gjitha të drejtat e rezervuara</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  console.log('[EMAIL SERVICE] Sending rejection email to:', vendor.email);
  const result = await sendEmail(mailOptions);
  console.log('[EMAIL SERVICE] Rejection email result:', result ? 'SUCCESS' : 'FAILED');
};

/**
 * Notify admin of new vendor application
 * @param {Object} vendor - Vendor data
 */
const notifyAdminNewVendor = async (vendor) => {
  console.log('[EMAIL SERVICE] notifyAdminNewVendor called for:', vendor.business_name);
  console.log('[EMAIL SERVICE] ADMIN_EMAIL_NOTIFICATIONS =', process.env.ADMIN_EMAIL_NOTIFICATIONS);
  console.log('[EMAIL SERVICE] isEmailConfigured() =', isEmailConfigured());
  console.log('[EMAIL SERVICE] SMTP_USER =', process.env.SMTP_USER || 'NOT SET');
  console.log('[EMAIL SERVICE] ADMIN_EMAIL (recipient) =', process.env.ADMIN_EMAIL || 'NOT SET');

  if (process.env.ADMIN_EMAIL_NOTIFICATIONS !== 'true') {
    console.log('[EMAIL SERVICE] SKIPPING - ADMIN_EMAIL_NOTIFICATIONS is not "true"');
    logger.info(`[EMAIL SKIPPED] Admin notification for new vendor: ${vendor.business_name}`);
    return;
  }

  // Format registration date
  const registrationDate = new Date().toLocaleDateString('sq-AL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
    to: process.env.ADMIN_EMAIL || 'admin@bashkiatirana.gov.al',
    subject: `Kërkesë e re për regjistrim - ${vendor.business_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: #dc2626; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .header span { color: #ffffff; font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #ffffff; }
          .intro { font-size: 16px; color: #1f2937; margin-bottom: 25px; }
          .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #dc2626; }
          .info-row { display: flex; margin-bottom: 12px; font-size: 15px; }
          .info-label { color: #6b7280; min-width: 140px; }
          .info-value { color: #1f2937; font-weight: 500; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { padding: 25px 30px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
          .signature { margin-top: 25px; }
          .signature p { margin: 5px 0; color: #4b5563; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>n'Bazaar360</h1>
            <span>Pazari i Ri - Tiranë</span>
          </div>
          <div class="content">
            <p class="intro">Një biznes i ri ka aplikuar për t'u bashkuar me n'Bazaar360.</p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Emri i Biznesit:</span>
                <span class="info-value">${vendor.business_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${vendor.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Kategoria:</span>
                <span class="info-value">${vendor.business_type || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data:</span>
                <span class="info-value">${registrationDate}</span>
              </div>
            </div>

            <div class="button-container">
              <a href="${FRONTEND_URL}/admin/tregtaret" class="button">Shqyrto Kërkesën</a>
            </div>

            <div class="signature">
              <p>Ekipi i n'Bazaar360</p>
            </div>
          </div>
          <div class="footer">
            <p>n'Bazaar360 Admin System</p>
            <p>&copy; ${new Date().getFullYear()} Të gjitha të drejtat e rezervuara</p>
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
