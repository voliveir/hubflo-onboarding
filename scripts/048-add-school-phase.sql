-- Add phase to university_schools for grouping recommended programs (Phase 1 = start, 2 = middle, 3 = end)
ALTER TABLE university_schools
ADD COLUMN IF NOT EXISTS phase INTEGER DEFAULT 1 CHECK (phase IN (1, 2, 3));

COMMENT ON COLUMN university_schools.phase IS 'Implementation phase: 1 = start (workspace, Hubflo), 2 = middle (billing, integrations), 3 = end (automations, etc.)';
