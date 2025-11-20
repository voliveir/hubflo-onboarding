-- Update time tracking to support granular activity types
-- This script adds new activity categories for better time tracking

-- First, update the check constraint to include new activity types
ALTER TABLE client_time_entries 
DROP CONSTRAINT IF EXISTS client_time_entries_entry_type_check;

ALTER TABLE client_time_entries
ADD CONSTRAINT client_time_entries_entry_type_check 
CHECK (entry_type IN (
  'meeting',
  'email',
  'initial_setup',
  'automation_workflow',
  'api_integration',
  'testing_debugging',
  'training_handoff',
  'revisions_rework',
  'implementation' -- Keep for backward compatibility
));

-- Add a comment to document the activity types
COMMENT ON COLUMN client_time_entries.entry_type IS 'Activity type: meeting, email, initial_setup, automation_workflow, api_integration, testing_debugging, training_handoff, revisions_rework, or implementation';

