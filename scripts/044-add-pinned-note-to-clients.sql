-- Add pinned note field to clients table for project scope and go-live date
-- This allows admins to create a pinned note visible to clients with:
-- - Initial scope of the project
-- - Changes to the scope
-- - Additions to the scope (with extra time estimates)
-- - First go-live date agreed upon during kickoff call

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS pinned_note JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN clients.pinned_note IS 'Pinned note for client portal containing initial_scope, scope_changes (array), go_live_date, and updated_at';
