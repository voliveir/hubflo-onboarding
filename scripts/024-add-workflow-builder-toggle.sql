-- Add workflow_builder_enabled toggle to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS workflow_builder_enabled BOOLEAN NOT NULL DEFAULT false; 