const { query, insert } = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * User Model
 */
const User = {
  /**
   * Find user by ID
   */
  findById: async (id) => {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  },

  /**
   * Find user by username
   */
  findByUsername: async (username) => {
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    return users[0] || null;
  },

  /**
   * Find user by business name
   */
  findByBusinessName: async (businessName) => {
    const users = await query('SELECT * FROM users WHERE business_name = ?', [businessName]);
    return users[0] || null;
  },

  /**
   * Check if username exists
   */
  usernameExists: async (username) => {
    const users = await query('SELECT id FROM users WHERE username = ?', [username]);
    return users.length > 0;
  },

  /**
   * Check if email exists
   */
  emailExists: async (email) => {
    const users = await query('SELECT id FROM users WHERE email = ?', [email]);
    return users.length > 0;
  },

  /**
   * Check if business name exists
   */
  businessNameExists: async (businessName) => {
    const users = await query('SELECT id FROM users WHERE business_name = ?', [businessName]);
    return users.length > 0;
  },

  /**
   * Create new user (vendor signup)
   */
  create: async (userData) => {
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const sql = `
      INSERT INTO users (
        email, password_hash, username, full_name, role, status,
        business_name, business_description, phone, business_type, address,
        about, contact_info, id_document_url, stall_photo_url,
        terms_accepted, terms_accepted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      userData.email,
      passwordHash,
      userData.username,
      userData.full_name || null, // Optional - not collected during registration
      userData.role || 'vendor',
      userData.status || 'pending',
      userData.business_name || null,
      userData.business_description || null,
      userData.phone || null,
      userData.business_type || null,
      userData.address || null, // Optional - not collected during registration
      userData.about || null,
      userData.contact_info || null,
      userData.id_document_url || null,
      userData.stall_photo_url || null,
      userData.terms_accepted || false,
      userData.terms_accepted ? new Date() : null
    ];

    const id = await insert(sql, params);
    return User.findById(id);
  },

  /**
   * Create admin user
   */
  createAdmin: async (userData) => {
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const sql = `
      INSERT INTO users (
        email, password_hash, username, full_name, role, status,
        terms_accepted, created_at
      ) VALUES (?, ?, ?, ?, 'admin', 'active', true, NOW())
    `;

    const params = [
      userData.email,
      passwordHash,
      userData.username,
      userData.full_name
    ];

    const id = await insert(sql, params);
    return User.findById(id);
  },

  /**
   * Verify password
   */
  verifyPassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Update user
   */
  update: async (id, updateData) => {
    const allowedFields = [
      'business_name', 'business_description', 'business_type', 'phone', 'address', 'about', 'contact_info',
      'logo_url', 'cover_image_url', 'is_active', 'last_login'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return User.findById(id);

    params.push(id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    return User.findById(id);
  },

  /**
   * Update last login
   */
  updateLastLogin: async (id) => {
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  /**
   * Approve vendor
   */
  approve: async (id, adminId) => {
    await query(
      `UPDATE users SET status = 'active', approved_by = ?, approved_at = NOW() WHERE id = ?`,
      [adminId, id]
    );
    return User.findById(id);
  },

  /**
   * Reject vendor
   */
  reject: async (id, reason) => {
    await query(
      `UPDATE users SET status = 'rejected', rejection_reason = ? WHERE id = ?`,
      [reason, id]
    );
    return User.findById(id);
  },

  /**
   * Suspend vendor
   */
  suspend: async (id, reason) => {
    await query(
      `UPDATE users SET status = 'suspended', rejection_reason = ? WHERE id = ?`,
      [reason, id]
    );
    return User.findById(id);
  },

  /**
   * Unsuspend vendor
   */
  unsuspend: async (id) => {
    await query(
      `UPDATE users SET status = 'active', rejection_reason = NULL WHERE id = ?`,
      [id]
    );
    return User.findById(id);
  },

  /**
   * Get all vendors with filters
   */
  getVendors: async (options = {}) => {
    const {
      status = null,
      business_type = null,
      search = null,
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC'
    } = options;

    let sql = `SELECT * FROM users WHERE role = 'vendor'`;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (business_type) {
      sql += ` AND business_type = ?`;
      params.push(business_type);
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        sql += ` AND (
          LOWER(business_name) LIKE LOWER(?)
          OR LOWER(full_name) LIKE LOWER(?)
          OR LOWER(username) LIKE LOWER(?)
          OR LOWER(business_type) LIKE LOWER(?)
          OR LOWER(business_description) LIKE LOWER(?)
        )`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }
    }

    // Count total
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    const allowedSorts = ['created_at', 'business_name', 'full_name', 'username'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${sortOrder}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const vendors = await query(sql, params);

    return { vendors, total, page, limit };
  },

  /**
   * Get pending vendor applications
   */
  getPendingVendors: async (page = 1, limit = 10) => {
    return User.getVendors({ status: 'pending', page, limit, sort: 'created_at', order: 'DESC' });
  },

  /**
   * Get active vendors (public)
   */
  getActiveVendors: async (options = {}) => {
    const {
      business_type = null,
      location_id = null,
      search = null,
      page = 1,
      limit = 10,
      sort = 'created_at'
    } = options;

    // Build WHERE conditions
    let whereConditions = `u.role = 'vendor' AND u.status = 'active'`;
    const params = [];

    if (business_type) {
      whereConditions += ` AND u.business_type = ?`;
      params.push(business_type);
    }

    if (location_id) {
      whereConditions += ` AND u.location_id = ?`;
      params.push(location_id);
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        whereConditions += ` AND (
          LOWER(u.business_name) LIKE LOWER(?)
          OR LOWER(u.full_name) LIKE LOWER(?)
          OR LOWER(u.business_type) LIKE LOWER(?)
          OR LOWER(u.business_description) LIKE LOWER(?)
          OR LOWER(u.address) LIKE LOWER(?)
        )`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }
    }

    // Count total (separate query)
    const countSql = `SELECT COUNT(*) as total FROM users u WHERE ${whereConditions}`;
    const countResult = await query(countSql, [...params]);
    const total = countResult[0].total;

    // Add sorting and pagination
    const sortMap = {
      popular: 'story_count DESC',
      newest: 'u.created_at DESC',
      name: 'u.business_name ASC'
    };
    const sortClause = sortMap[sort] || sortMap.newest;

    const sql = `
      SELECT
        u.id, u.username, u.business_name, u.business_type, u.address,
        u.logo_url, u.business_description as short_description,
        (SELECT COUNT(*) FROM ar_stories WHERE vendor_id = u.id AND is_published = 1) as story_count
      FROM users u
      WHERE ${whereConditions}
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    const vendors = await query(sql, [...params, limit, (page - 1) * limit]);

    return { vendors, total, page, limit };
  },

  /**
   * Get vendor public profile by username
   */
  getPublicProfile: async (username) => {
    const sql = `
      SELECT
        u.id, u.username, u.full_name, u.business_name, u.business_description,
        u.business_type, u.address, u.about, u.contact_info,
        u.phone, u.email, u.logo_url, u.cover_image_url, u.location_id,
        l.name as location_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.username = ? AND u.role = 'vendor' AND u.status = 'active'
    `;
    const users = await query(sql, [username]);

    // Parse contact_info JSON if exists
    if (users[0] && users[0].contact_info) {
      try {
        const contactInfo = JSON.parse(users[0].contact_info);
        users[0].website = contactInfo.website || null;
        users[0].opening_hours = contactInfo.opening_hours || null;
      } catch (e) {
        // contact_info is not valid JSON, ignore
      }
    }

    return users[0] || null;
  },

  /**
   * Get vendor public profile by ID
   */
  getPublicProfileById: async (id) => {
    const sql = `
      SELECT
        u.id, u.username, u.full_name, u.business_name, u.business_description,
        u.business_type, u.address, u.about, u.contact_info,
        u.phone, u.email, u.logo_url, u.cover_image_url, u.location_id,
        l.name as location_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = ? AND u.role = 'vendor' AND u.status = 'active'
    `;
    const users = await query(sql, [id]);

    // Parse contact_info JSON if exists
    if (users[0] && users[0].contact_info) {
      try {
        const contactInfo = JSON.parse(users[0].contact_info);
        users[0].website = contactInfo.website || null;
        users[0].opening_hours = contactInfo.opening_hours || null;
      } catch (e) {
        // contact_info is not valid JSON, ignore
      }
    }

    return users[0] || null;
  },

  /**
   * Delete user
   */
  delete: async (id) => {
    await query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
};

module.exports = User;
