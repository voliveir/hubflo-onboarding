-- Add workflow column to clients table for storing workflow builder data
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS workflow JSONB DEFAULT '{}'::jsonb; 