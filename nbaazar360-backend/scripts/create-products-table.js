/**
 * Create products table for vendor product showcase
 * Run: node scripts/create-products-table.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function createProductsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected to database');

  try {
    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Products table created successfully!');

    // Add index for faster queries by vendor
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id)
    `).catch(() => {
      // Index might already exist, ignore error
      console.log('Index already exists or skipped');
    });

    console.log('Done!');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createProductsTable();
