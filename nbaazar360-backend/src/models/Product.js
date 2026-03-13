const { query, insert } = require('../config/database');

/**
 * Product Model - Vendor product showcase (display only, no cart/buying)
 */
const Product = {
  /**
   * Find product by ID
   */
  findById: async (id) => {
    const products = await query('SELECT * FROM products WHERE id = ?', [id]);
    return products[0] || null;
  },

  /**
   * Get all products for a vendor
   */
  getByVendorId: async (vendorId) => {
    return query(
      'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC',
      [vendorId]
    );
  },

  /**
   * Create new product
   */
  create: async (productData) => {
    const sql = `
      INSERT INTO products (vendor_id, name, price, image_url, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const params = [
      productData.vendor_id,
      productData.name,
      productData.price,
      productData.image_url || null
    ];

    const id = await insert(sql, params);
    return Product.findById(id);
  },

  /**
   * Update product
   */
  update: async (id, updateData) => {
    const allowedFields = ['name', 'price', 'image_url'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return Product.findById(id);

    params.push(id);
    await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    return Product.findById(id);
  },

  /**
   * Delete product
   */
  delete: async (id) => {
    await query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  },

  /**
   * Count products for a vendor
   */
  countByVendorId: async (vendorId) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM products WHERE vendor_id = ?',
      [vendorId]
    );
    return result[0].count;
  }
};

module.exports = Product;
