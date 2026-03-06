-- Migration: Make full_name column nullable
-- Run this script to fix "Column 'full_name' cannot be null" error
-- Date: 2024

-- Alter the users table to allow NULL for full_name
ALTER TABLE users MODIFY COLUMN full_name VARCHAR(255) NULL DEFAULT NULL;

-- Verify the change
DESCRIBE users;
