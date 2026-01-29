-- Store recommended schools by phase (from the question's phase when client answered)
-- So Phase 1 = schools recommended by Phase 1 questions, etc.
ALTER TABLE university_client_onboarding
ADD COLUMN IF NOT EXISTS recommended_school_ids_by_phase JSONB DEFAULT '{"1":[],"2":[],"3":[]}'::jsonb;

COMMENT ON COLUMN university_client_onboarding.recommended_school_ids_by_phase IS 'Schools recommended per phase: {"1": [uuid,...], "2": [...], "3": [...]} from onboarding question phases';
