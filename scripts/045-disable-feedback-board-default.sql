-- Add feedback_board_enabled column to clients table if it doesn't exist
-- Set default to false and update all existing clients to false
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS feedback_board_enabled BOOLEAN DEFAULT false;

-- Make the column NOT NULL if it isn't already
-- First, update any NULL values to false
UPDATE clients 
SET feedback_board_enabled = false
WHERE feedback_board_enabled IS NULL;

-- Now set all clients to false (this ensures all existing clients are disabled)
UPDATE clients 
SET feedback_board_enabled = false;

-- Alter the column to be NOT NULL with default false
-- This will only work if there are no NULL values
DO $$
BEGIN
    -- Check if column exists and is nullable, then alter it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'feedback_board_enabled'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE clients 
        ALTER COLUMN feedback_board_enabled SET NOT NULL,
        ALTER COLUMN feedback_board_enabled SET DEFAULT false;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN clients.feedback_board_enabled IS 'Whether to show the feedback and requests board to the client. Defaults to false.';
