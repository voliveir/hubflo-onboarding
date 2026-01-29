-- University Onboarding: questions and client responses for personalized program recommendations
-- Questions are editable in admin; client sees form on first visit; recommended programs persist.

-- Onboarding questions (admin-editable): question text, options, and which schools to recommend per answer
CREATE TABLE IF NOT EXISTS university_onboarding_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    question_key VARCHAR(100) NOT NULL UNIQUE,
    input_type VARCHAR(50) NOT NULL DEFAULT 'yes_no' CHECK (input_type IN ('yes_no', 'multi_choice')),
    -- options: for yes_no [{ value: 'yes', label: 'Yes', recommended_school_ids: [uuid,...] }, { value: 'no', ... }]
    -- for multi_choice same structure; selected options' recommended_school_ids are merged
    options JSONB NOT NULL DEFAULT '[]',
    phase INTEGER NOT NULL DEFAULT 1 CHECK (phase IN (1, 2, 3)),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client onboarding state: one row per client; completed_at set when they submit the form
CREATE TABLE IF NOT EXISTS university_client_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    completed_at TIMESTAMP WITH TIME ZONE,
    responses JSONB NOT NULL DEFAULT '{}',
    recommended_school_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_university_client_onboarding_client_id ON university_client_onboarding(client_id);

CREATE TRIGGER update_university_onboarding_questions_updated_at
    BEFORE UPDATE ON university_onboarding_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_client_onboarding_updated_at
    BEFORE UPDATE ON university_client_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default questions (can be edited in admin)
INSERT INTO university_onboarding_questions (title, question_text, question_key, input_type, options, phase, sort_order) VALUES
(
  'First time with Hubflo',
  'Is this your first time using Hubflo?',
  'first_time_hubflo',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  1,
  10
),
(
  'Project management, time tracking, or tasks',
  'Will you be using Hubflo as a project management tool, for time tracking, or tasks?',
  'using_projects_time_tasks',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  1,
  20
),
(
  'Messaging, email, or forms',
  'Will you be using messaging, email, or forms?',
  'using_messaging_email_forms',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  1,
  30
),
(
  'Billing or SmartDocs',
  'Will you be using billing or SmartDocs?',
  'using_billing_smartdocs',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  2,
  40
),
(
  'Automations or Zapier',
  'Will you be doing automations or using Zapier?',
  'using_automations_zapier',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  3,
  50
),
(
  'Importing data or integrating other software',
  'Will you be importing data or integrating other software?',
  'using_imports_integrations',
  'yes_no',
  '[{"value":"yes","label":"Yes","recommended_school_ids":[]},{"value":"no","label":"No","recommended_school_ids":[]}]'::jsonb,
  3,
  60
)
ON CONFLICT (question_key) DO NOTHING;
