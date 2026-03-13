const { query, insert } = require('../config/database');

/**
 * ContactMessage Model
 * Stores all contact form submissions
 */
const ContactMessage = {
  /**
   * Create new contact message
   */
  create: async (messageData) => {
    const sql = `
      INSERT INTO contact_messages (
        first_name, last_name, email, message, sent_at, email_sent
      ) VALUES (?, ?, ?, ?, NOW(), ?)
    `;

    const params = [
      messageData.first_name,
      messageData.last_name,
      messageData.email,
      messageData.message,
      messageData.email_sent || false
    ];

    const id = await insert(sql, params);
    return ContactMessage.findById(id);
  },

  /**
   * Find message by ID
   */
  findById: async (id) => {
    const messages = await query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    return messages[0] || null;
  },

  /**
   * Update email_sent status
   */
  markEmailSent: async (id) => {
    await query('UPDATE contact_messages SET email_sent = TRUE WHERE id = ?', [id]);
    return ContactMessage.findById(id);
  },

  /**
   * Get all messages (admin)
   */
  getAll: async (options = {}) => {
    const { page = 1, limit = 20 } = options;

    const countResult = await query('SELECT COUNT(*) as total FROM contact_messages');
    const total = countResult[0].total;

    const sql = `
      SELECT * FROM contact_messages
      ORDER BY sent_at DESC
      LIMIT ? OFFSET ?
    `;

    const messages = await query(sql, [limit, (page - 1) * limit]);

    return { messages, total, page, limit };
  },

  /**
   * Get unread/unsent messages
   */
  getUnsent: async () => {
    return query('SELECT * FROM contact_messages WHERE email_sent = FALSE ORDER BY sent_at DESC');
  }
};

module.exports = ContactMessage;
