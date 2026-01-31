-- Activity groups: combine multiple browser activities into one block
-- e.g. switching between tabs for same client - group into one project block

CREATE TABLE IF NOT EXISTS activity_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    time_entry_id UUID REFERENCES client_time_entries(id) ON DELETE SET NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE browser_activity
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES activity_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_browser_activity_group_id ON browser_activity(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_groups_client_id ON activity_groups(client_id);

-- RLS for activity_groups
ALTER TABLE activity_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_groups_allow_all" ON activity_groups;
CREATE POLICY "activity_groups_allow_all" ON activity_groups
  FOR ALL USING (true) WITH CHECK (true);
