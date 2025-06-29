-- Add project tracking columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS calls_scheduled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS calls_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forms_setup INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS smartdocs_setup INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS zapier_integrations_setup INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS migration_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_access_granted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_completion_percentage INTEGER DEFAULT 0;

-- Create client_checklist table for tracking detailed tasks
CREATE TABLE IF NOT EXISTS client_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('basics', 'project_boards', 'workspace_templates')),
    task_key VARCHAR(100) NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, task_key)
);

-- Create client_checklists table
CREATE TABLE IF NOT EXISTS client_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  task_key VARCHAR(100) NOT NULL,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, task_key)
);

-- Create client_project_tasks table for custom tasks
CREATE TABLE IF NOT EXISTS client_project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to VARCHAR(255),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project tracking table
CREATE TABLE IF NOT EXISTS project_tracking (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  milestone VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  assigned_to VARCHAR(255),
  due_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_checklist_client_id ON client_checklist(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checklist_category ON client_checklist(category);
CREATE INDEX IF NOT EXISTS idx_client_checklist_completed ON client_checklist(is_completed);
CREATE INDEX IF NOT EXISTS idx_client_checklists_client_id ON client_checklists(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checklists_completed ON client_checklists(is_completed);
CREATE INDEX IF NOT EXISTS idx_client_project_tasks_client_id ON client_project_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_client_project_tasks_status ON client_project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_client_project_tasks_due_date ON client_project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tracking_client_id ON project_tracking(client_id);

-- Create or update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_client_checklist_updated_at ON client_checklist;
CREATE TRIGGER update_client_checklist_updated_at 
  BEFORE UPDATE ON client_checklist 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_checklists_updated_at ON client_checklists;
CREATE TRIGGER update_client_checklists_updated_at 
  BEFORE UPDATE ON client_checklists 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_project_tasks_updated_at ON client_project_tasks;
CREATE TRIGGER update_client_project_tasks_updated_at 
  BEFORE UPDATE ON client_project_tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default checklist items for existing clients
INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'basics',
  'workspace_setup',
  'Workspace Setup Complete',
  'Initial workspace configuration and basic settings'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'workspace_setup'
);

INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'basics',
  'team_invited',
  'Team Members Invited',
  'All team members have been invited and have access'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'team_invited'
);

INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'project_boards',
  'boards_created',
  'Project Boards Created',
  'Main project boards have been set up'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'boards_created'
);

INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'project_boards',
  'workflows_configured',
  'Workflows Configured',
  'Custom workflows and automation rules are set up'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'workflows_configured'
);

INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'workspace_templates',
  'templates_imported',
  'Templates Imported',
  'Relevant templates have been imported and customized'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'templates_imported'
);

INSERT INTO client_checklists (client_id, category, task_key, task_title, task_description)
SELECT 
  c.id,
  'workspace_templates',
  'branding_applied',
  'Branding Applied',
  'Company branding and customization completed'
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_checklists cc 
  WHERE cc.client_id = c.id AND cc.task_key = 'branding_applied'
);

-- Insert some sample project tasks for existing clients
INSERT INTO client_project_tasks (client_id, title, description, category, priority, status)
SELECT 
  c.id,
  'Complete onboarding call #1',
  'Initial discovery and requirements gathering session',
  'onboarding',
  'high',
  CASE WHEN c.calls_completed >= 1 THEN 'completed' ELSE 'pending' END
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM client_project_tasks cpt 
  WHERE cpt.client_id = c.id AND cpt.title = 'Complete onboarding call #1'
);

INSERT INTO client_project_tasks (client_id, title, description, category, priority, status)
SELECT 
  c.id,
  'Set up initial forms',
  'Configure and deploy client intake forms',
  'forms',
  'medium',
  CASE WHEN c.forms_setup >= 1 THEN 'completed' ELSE 'pending' END
FROM clients c
WHERE c.success_package IN ('premium', 'gold', 'elite')
AND NOT EXISTS (
  SELECT 1 FROM client_project_tasks cpt 
  WHERE cpt.client_id = c.id AND cpt.title = 'Set up initial forms'
);

INSERT INTO client_project_tasks (client_id, title, description, category, priority, status)
SELECT 
  c.id,
  'Configure Zapier integrations',
  'Set up automated workflows and integrations',
  'integrations',
  'medium',
  CASE WHEN c.zapier_integrations_setup >= 1 THEN 'completed' ELSE 'pending' END
FROM clients c
WHERE c.success_package IN ('premium', 'gold', 'elite')
AND NOT EXISTS (
  SELECT 1 FROM client_project_tasks cpt 
  WHERE cpt.client_id = c.id AND cpt.title = 'Configure Zapier integrations'
);

-- Insert sample project tracking data
INSERT INTO project_tracking (client_id, milestone, description, status, assigned_to, due_date) VALUES
(1, 'Initial Discovery Call', 'Conduct initial discovery call to understand requirements', 'completed', 'John Doe', '2024-01-15'),
(1, 'Technical Requirements Gathering', 'Gather detailed technical requirements', 'completed', 'Jane Smith', '2024-01-22'),
(1, 'Integration Setup', 'Set up required integrations', 'in_progress', 'Mike Johnson', '2024-02-01'),
(2, 'Initial Discovery Call', 'Conduct initial discovery call to understand requirements', 'completed', 'John Doe', '2024-01-10'),
(2, 'Technical Requirements Gathering', 'Gather detailed technical requirements', 'in_progress', 'Jane Smith', '2024-01-20'),
(3, 'Initial Discovery Call', 'Conduct initial discovery call to understand requirements', 'pending', 'John Doe', '2024-02-05')
ON CONFLICT DO NOTHING;

-- Update project completion percentages for existing clients
UPDATE clients SET project_completion_percentage = (
  SELECT COALESCE(
    ROUND(
      (COUNT(CASE WHEN cc.is_completed THEN 1 END)::FLOAT / 
       NULLIF(COUNT(cc.id), 0)) * 100
    ), 0
  )
  FROM client_checklists cc 
  WHERE cc.client_id = clients.id
);
