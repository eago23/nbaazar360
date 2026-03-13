const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

// Email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 * Send a contact message to the admin
 */
router.post('/', async (req, res) => {
  try {
    const { emri, mbiemri, email, mesazhi } = req.body;

    // Validate required fields
    if (!emri || !mbiemri || !email || !mesazhi) {
      return res.status(400).json({
        success: false,
        message: 'Ju lutemi plotësoni të gjitha fushat.',
        error: 'MISSING_FIELDS'
      });
    }

    // Trim values
    const trimmedEmri = emri.trim();
    const trimmedMbiemri = mbiemri.trim();
    const trimmedEmail = email.trim();
    const trimmedMesazhi = mesazhi.trim();

    // Validate email format
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Ju lutemi vendosni një email të vlefshëm.',
        error: 'INVALID_EMAIL'
      });
    }

    // Validate field lengths
    if (trimmedEmri.length < 2 || trimmedEmri.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Emri duhet të jetë mes 2 dhe 50 karaktere.',
        error: 'INVALID_NAME'
      });
    }

    if (trimmedMbiemri.length < 2 || trimmedMbiemri.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Mbiemri duhet të jetë mes 2 dhe 50 karaktere.',
        error: 'INVALID_SURNAME'
      });
    }

    if (trimmedMesazhi.length < 10 || trimmedMesazhi.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Mesazhi duhet të jetë mes 10 dhe 2000 karaktere.',
        error: 'INVALID_MESSAGE'
      });
    }

    // Admin email from environment variable
    const adminEmail = process.env.ADMIN_EMAIL || 'agoelkier@gmail.com';

    // Prepare email content
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@nbaazar360.al',
      to: adminEmail,
      subject: `Mesazh i ri nga ${trimmedEmri} ${trimmedMbiemri} - n'Bazaar360`,
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
            .info-row { margin-bottom: 12px; font-size: 15px; }
            .info-label { color: #6b7280; font-weight: 600; }
            .info-value { color: #1f2937; }
            .message-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .message-label { color: #6b7280; font-weight: 600; margin-bottom: 10px; display: block; }
            .message-content { color: #1f2937; white-space: pre-wrap; line-height: 1.6; }
            .footer { padding: 25px 30px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>n'Bazaar360</h1>
              <span>Mesazh Kontakti</span>
            </div>
            <div class="content">
              <p class="intro">Keni marrë një mesazh të ri nga formulari i kontaktit.</p>

              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Emri: </span>
                  <span class="info-value">${trimmedEmri} ${trimmedMbiemri}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email: </span>
                  <span class="info-value"><a href="mailto:${trimmedEmail}">${trimmedEmail}</a></span>
                </div>
              </div>

              <div class="message-box">
                <span class="message-label">Mesazhi:</span>
                <p class="message-content">${trimmedMesazhi.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
            </div>
            <div class="footer">
              <p>n'Bazaar360 - Pazari i Ri, Tiranë</p>
              <p>&copy; ${new Date().getFullYear()} Të gjitha të drejtat e rezervuara</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Mesazh i ri nga n'Bazaar360

Emri: ${trimmedEmri} ${trimmedMbiemri}
Email: ${trimmedEmail}

Mesazhi:
${trimmedMesazhi}
      `
    };

    // Send email
    const emailSent = await sendEmail(mailOptions);

    if (emailSent) {
      logger.info(`Contact message sent from ${trimmedEmail}`);
      return res.json({
        success: true,
        message: 'Mesazhi juaj u dërgua me sukses!'
      });
    } else {
      logger.error(`Failed to send contact message from ${trimmedEmail}`);
      return res.status(500).json({
        success: false,
        message: 'Ndodhi një gabim. Ju lutemi provoni përsëri.',
        error: 'EMAIL_SEND_FAILED'
      });
    }
  } catch (error) {
    logger.error('Contact form error:', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Ndodhi një gabim. Ju lutemi provoni përsëri.',
      error: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
