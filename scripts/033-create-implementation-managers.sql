-- Create implementation_managers table for editable manager calendar links
CREATE TABLE IF NOT EXISTS implementation_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id TEXT UNIQUE NOT NULL, -- e.g. 'vanessa', 'vishal'
    name TEXT NOT NULL,
    calendar_contact_success TEXT,
    calendar_schedule_call TEXT,
    calendar_integrations_call TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial managers (Vanessa, Vishal)
INSERT INTO implementation_managers (manager_id, name, calendar_contact_success, calendar_schedule_call, calendar_integrations_call)
VALUES
  ('vanessa', 'Vanessa Oliveira',
    'https://calendly.com/vanessa-hubflo/30min-quick-sync',
    'https://calendly.com/vanessa-hubflo/45min-onboarding-call',
    'https://calendly.com/vanessa-hubflo/45min-integrations-call'),
  ('vishal', 'Vishal Jassal',
    'https://calendly.com/vishal-hubflo/30min-quick-sync',
    'https://calendly.com/vishal-hubflo/45min-onboarding-call',
    'https://calendly.com/vishal-hubflo/45min-integrations-call')
ON CONFLICT (manager_id) DO NOTHING; 