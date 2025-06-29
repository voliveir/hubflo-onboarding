-- Ensure the integrations table has the correct schema
-- This script is idempotent and safe to run multiple times

-- Add missing columns if they don't exist
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure all existing records have is_active set to true
UPDATE integrations 
SET is_active = true 
WHERE is_active IS NULL;

-- Make is_active NOT NULL
ALTER TABLE integrations 
ALTER COLUMN is_active SET NOT NULL;
