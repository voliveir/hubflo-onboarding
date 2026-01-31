-- Link browser_activity to client_time_entries when a client is assigned
-- When user assigns a client, we create a time entry; this tracks the link for updates/deletes

ALTER TABLE browser_activity
ADD COLUMN IF NOT EXISTS time_entry_id UUID REFERENCES client_time_entries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_browser_activity_time_entry_id ON browser_activity(time_entry_id);
