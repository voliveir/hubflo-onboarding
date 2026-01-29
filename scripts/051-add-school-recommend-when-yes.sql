-- Recommend this program when client answers Yes to all of the listed onboarding question keys
ALTER TABLE university_schools
ADD COLUMN IF NOT EXISTS recommend_when_yes_to_question_keys JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN university_schools.recommend_when_yes_to_question_keys IS 'When non-empty: recommend this program only if client answered Yes to every question_key in this array (from onboarding form)';
