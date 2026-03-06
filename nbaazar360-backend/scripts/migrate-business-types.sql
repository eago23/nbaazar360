-- Migration: Update business_type column to support Albanian categories
-- Run this script once to update the database schema and existing data

-- Step 1: Change ENUM to VARCHAR to support Albanian characters
ALTER TABLE users
MODIFY COLUMN business_type VARCHAR(50);

-- Step 2: Update existing vendors to new category values
-- Map old English values to new Albanian categories
UPDATE users SET business_type = 'Restorant' WHERE business_type = 'restaurant';
UPDATE users SET business_type = 'Kafe & Bar' WHERE business_type = 'cafe';
UPDATE users SET business_type = 'Artizanat & Suvenire' WHERE business_type = 'artisan';
UPDATE users SET business_type = 'Dyqan' WHERE business_type = 'shop';
UPDATE users SET business_type = 'Dyqan' WHERE business_type = 'service';

-- Step 3: Set default for any NULL or unknown values
UPDATE users SET business_type = 'Dyqan' WHERE business_type IS NULL AND role = 'vendor';
UPDATE users SET business_type = 'Dyqan' WHERE business_type NOT IN ('Restorant', 'Kafe & Bar', 'Artizanat & Suvenire', 'Prodhime Vendore', 'Dyqan') AND role = 'vendor';

-- Verify the migration
SELECT id, business_name, business_type FROM users WHERE role = 'vendor';
