-- Add category to activity groups (Call, Lunch, Prep, Setup, etc.)

ALTER TABLE activity_groups
ADD COLUMN IF NOT EXISTS category VARCHAR(64);

COMMENT ON COLUMN activity_groups.category IS 'E.g. Call, Automation/Integration, Prep, Setup, Lunch, Other';
