-- Create kanban board system for success package workflows
-- This script adds the necessary tables and data for the kanban board functionality

-- Create client_stages table to track current stage for each client
CREATE TABLE IF NOT EXISTS client_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) NOT NULL,
    stage_order INTEGER NOT NULL DEFAULT 0,
    stage_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stage_completed_at TIMESTAMP WITH TIME ZONE,
    stage_notes TEXT,
    next_action_required TEXT,
    next_action_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id)
);

-- Create kanban_workflows table to define workflow stages for each package
CREATE TABLE IF NOT EXISTS kanban_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    success_package VARCHAR(50) NOT NULL,
    stage_key VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_description TEXT,
    stage_order INTEGER NOT NULL,
    is_final_stage BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#3B82F6',
    icon_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(success_package, stage_key)
);

-- Create kanban_activities table to track activities within each stage
CREATE TABLE IF NOT EXISTS kanban_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stage_key VARCHAR(50) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    activity_description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    assigned_to VARCHAR(255),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert workflow stages for each success package
-- Light Package: New -> Call -> Graduation -> Archived
INSERT INTO kanban_workflows (success_package, stage_key, stage_name, stage_description, stage_order, is_final_stage, color, icon_name) VALUES
('light', 'new', 'New Client', 'Client has signed up and needs initial contact', 1, FALSE, '#10B981', 'UserPlus'),
('light', 'call', 'Onboarding Call', 'Initial Zoom call with product specialist', 2, FALSE, '#3B82F6', 'Phone'),
('light', 'graduation', 'Graduation', 'Client has completed onboarding and is ready', 3, FALSE, '#8B5CF6', 'GraduationCap'),
('light', 'archived', 'Archived', 'Client is archived', 4, TRUE, '#6B7280', 'Archive');

-- Premium Package: New -> 1st Call -> 2nd Call -> Graduation -> Archived
INSERT INTO kanban_workflows (success_package, stage_key, stage_name, stage_description, stage_order, is_final_stage, color, icon_name) VALUES
('premium', 'new', 'New Client', 'Client has signed up and needs initial contact', 1, FALSE, '#10B981', 'UserPlus'),
('premium', 'first_call', '1st Onboarding Call', 'Initial discovery and requirements gathering', 2, FALSE, '#3B82F6', 'Phone'),
('premium', 'second_call', '2nd Onboarding Call', 'Workflow mapping and workspace structuring', 3, FALSE, '#F59E0B', 'PhoneCall'),
('premium', 'graduation', 'Graduation', 'Client has completed onboarding and is ready', 4, FALSE, '#8B5CF6', 'GraduationCap'),
('premium', 'archived', 'Archived', 'Client is archived', 5, TRUE, '#6B7280', 'Archive');

-- Gold Package: New -> 1st Call -> 2nd Call -> 3rd Call -> Graduation -> Archived
INSERT INTO kanban_workflows (success_package, stage_key, stage_name, stage_description, stage_order, is_final_stage, color, icon_name) VALUES
('gold', 'new', 'New Client', 'Client has signed up and needs initial contact', 1, FALSE, '#10B981', 'UserPlus'),
('gold', 'first_call', '1st Onboarding Call', 'Initial discovery and requirements gathering', 2, FALSE, '#3B82F6', 'Phone'),
('gold', 'second_call', '2nd Onboarding Call', 'Advanced workflow setup and integrations', 3, FALSE, '#F59E0B', 'PhoneCall'),
('gold', 'third_call', '3rd Onboarding Call', 'Advanced integrations and optimization', 4, FALSE, '#EF4444', 'PhoneIncoming'),
('gold', 'graduation', 'Graduation', 'Client has completed onboarding and is ready', 5, FALSE, '#8B5CF6', 'GraduationCap'),
('gold', 'archived', 'Archived', 'Client is archived', 6, TRUE, '#6B7280', 'Archive');

-- Elite Package: New -> 1st Call -> 2nd Call -> 3rd Call -> Graduation -> Archived
INSERT INTO kanban_workflows (success_package, stage_key, stage_name, stage_description, stage_order, is_final_stage, color, icon_name) VALUES
('elite', 'new', 'New Client', 'Client has signed up and needs initial contact', 1, FALSE, '#10B981', 'UserPlus'),
('elite', 'first_call', '1st Onboarding Call', 'Initial discovery and requirements gathering', 2, FALSE, '#3B82F6', 'Phone'),
('elite', 'second_call', '2nd Onboarding Call', 'Advanced workflow setup and integrations', 3, FALSE, '#F59E0B', 'PhoneCall'),
('elite', 'third_call', '3rd Onboarding Call', 'Advanced integrations and optimization', 4, FALSE, '#EF4444', 'PhoneIncoming'),
('elite', 'graduation', 'Graduation', 'Client has completed onboarding and is ready', 5, FALSE, '#8B5CF6', 'GraduationCap'),
('elite', 'archived', 'Archived', 'Client is archived', 6, TRUE, '#6B7280', 'Archive');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_stages_client_id ON client_stages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stages_current_stage ON client_stages(current_stage);
CREATE INDEX IF NOT EXISTS idx_kanban_workflows_package ON kanban_workflows(success_package);
CREATE INDEX IF NOT EXISTS idx_kanban_workflows_order ON kanban_workflows(stage_order);
CREATE INDEX IF NOT EXISTS idx_kanban_activities_client_id ON kanban_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_kanban_activities_stage ON kanban_activities(stage_key);
CREATE INDEX IF NOT EXISTS idx_kanban_activities_status ON kanban_activities(status);

-- Initialize client stages for existing clients
INSERT INTO client_stages (client_id, current_stage, stage_order)
SELECT 
    c.id,
    CASE 
        WHEN c.calls_completed >= 3 THEN 'graduation'
        WHEN c.calls_completed >= 2 THEN 
            CASE 
                WHEN c.success_package IN ('gold', 'elite') THEN 'third_call'
                ELSE 'second_call'
            END
        WHEN c.calls_completed >= 1 THEN 
            CASE 
                WHEN c.success_package = 'light' THEN 'call'
                ELSE 'first_call'
            END
        ELSE 'new'
    END,
    CASE 
        WHEN c.calls_completed >= 3 THEN 5
        WHEN c.calls_completed >= 2 THEN 
            CASE 
                WHEN c.success_package IN ('gold', 'elite') THEN 4
                ELSE 3
            END
        WHEN c.calls_completed >= 1 THEN 
            CASE 
                WHEN c.success_package = 'light' THEN 2
                ELSE 2
            END
        ELSE 1
    END
FROM clients c
WHERE c.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM client_stages cs WHERE cs.client_id = c.id
);

-- Create updated_at trigger for client_stages
CREATE OR REPLACE TRIGGER update_client_stages_updated_at 
    BEFORE UPDATE ON client_stages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for kanban_activities
CREATE OR REPLACE TRIGGER update_kanban_activities_updated_at 
    BEFORE UPDATE ON kanban_activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 