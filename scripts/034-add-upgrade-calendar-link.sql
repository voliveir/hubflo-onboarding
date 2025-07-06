-- Add upgrade consultation calendar link to implementation_managers
ALTER TABLE implementation_managers
ADD COLUMN IF NOT EXISTS calendar_upgrade_consultation TEXT; 