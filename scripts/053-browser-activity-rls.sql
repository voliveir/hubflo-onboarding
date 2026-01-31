-- Allow access to browser_activity for API (anon key) and service role
-- Run this if inserts/selects are failing due to RLS

-- Enable RLS (no-op if already enabled)
ALTER TABLE browser_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for anon and authenticated (matches time-entries pattern)
-- Adjust if your project uses stricter auth
DROP POLICY IF EXISTS "browser_activity_allow_all" ON browser_activity;
CREATE POLICY "browser_activity_allow_all" ON browser_activity
  FOR ALL
  USING (true)
  WITH CHECK (true);
