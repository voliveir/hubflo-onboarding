-- Store recommended courses (in addition to schools) so admins can point clients to specific courses
ALTER TABLE university_client_onboarding
ADD COLUMN IF NOT EXISTS recommended_course_ids UUID[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommended_course_ids_by_phase JSONB DEFAULT '{"1":[],"2":[],"3":[]}'::jsonb;

COMMENT ON COLUMN university_client_onboarding.recommended_course_ids IS 'Course IDs recommended from onboarding (flat list)';
COMMENT ON COLUMN university_client_onboarding.recommended_course_ids_by_phase IS 'Courses recommended per phase: {"1": [uuid,...], "2": [...], "3": [...]} from onboarding question phases';
