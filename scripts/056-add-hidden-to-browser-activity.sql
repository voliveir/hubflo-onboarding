-- Add is_hidden to browser_activity - hide activities (e.g. lunch browsing) from timeline

ALTER TABLE browser_activity
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_browser_activity_is_hidden ON browser_activity(is_hidden);
