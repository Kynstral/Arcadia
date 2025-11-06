-- Make price field optional for library users
-- Libraries may not sell books but still need to track replacement costs

-- First, update any NULL prices to 0 (shouldn't be any, but just in case)
UPDATE books SET price = 0 WHERE price IS NULL;

-- Alter the price column to allow NULL and set default to 0
ALTER TABLE books 
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN price SET DEFAULT 0;

-- Add a comment to document the field's purpose
COMMENT ON COLUMN books.price IS 'Sale price for bookstores, or replacement cost for libraries. Optional for library users.';
