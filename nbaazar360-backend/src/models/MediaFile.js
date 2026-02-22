const { query, insert } = require('../config/database');

/**
 * MediaFile Model
 */
const MediaFile = {
  /**
   * Find media file by ID
   */
  findById: async (id) => {
    const files = await query('SELECT * FROM media_files WHERE id = ?', [id]);
    return files[0] || null;
  },

  /**
   * Create media file record
   */
  create: async (fileData) => {
    const sql = `
      INSERT INTO media_files (
        file_name, file_path, file_url, file_type, mime_type,
        file_size_kb, width, height, uploaded_by,
        entity_type, entity_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      fileData.file_name,
      fileData.file_path || null,
      fileData.file_url,
      fileData.file_type,
      fileData.mime_type || null,
      fileData.file_size_kb || null,
      fileData.width || null,
      fileData.height || null,
      fileData.uploaded_by || null,
      fileData.entity_type || null,
      fileData.entity_id || null
    ];

    const id = await insert(sql, params);
    return MediaFile.findById(id);
  },

  /**
   * Delete media file record
   */
  delete: async (id) => {
    await query('DELETE FROM media_files WHERE id = ?', [id]);
    return true;
  },

  /**
   * Get files by entity
   */
  getByEntity: async (entityType, entityId) => {
    return query(
      'SELECT * FROM media_files WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC',
      [entityType, entityId]
    );
  },

  /**
   * Get files by type
   */
  getByType: async (fileType, options = {}) => {
    const { page = 1, limit = 20 } = options;

    const countResult = await query(
      'SELECT COUNT(*) as total FROM media_files WHERE file_type = ?',
      [fileType]
    );
    const total = countResult[0].total;

    const files = await query(
      'SELECT * FROM media_files WHERE file_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [fileType, limit, (page - 1) * limit]
    );

    return { files, total, page, limit };
  },

  /**
   * Get files uploaded by user
   */
  getByUploader: async (uploaderId, options = {}) => {
    const { page = 1, limit = 20 } = options;

    const countResult = await query(
      'SELECT COUNT(*) as total FROM media_files WHERE uploaded_by = ?',
      [uploaderId]
    );
    const total = countResult[0].total;

    const files = await query(
      'SELECT * FROM media_files WHERE uploaded_by = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [uploaderId, limit, (page - 1) * limit]
    );

    return { files, total, page, limit };
  },

  /**
   * Update entity association
   */
  updateEntity: async (id, entityType, entityId) => {
    await query(
      'UPDATE media_files SET entity_type = ?, entity_id = ? WHERE id = ?',
      [entityType, entityId, id]
    );
    return MediaFile.findById(id);
  }
};

module.exports = MediaFile;
