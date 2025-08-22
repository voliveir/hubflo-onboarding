-- Create implementation milestones system
-- This adds a comprehensive milestone tracking system for client implementation progress

-- Create implementation_milestones table
CREATE TABLE IF NOT EXISTS implementation_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_days INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, order_index)
);

-- Create milestone_templates table for predefined milestone types
CREATE TABLE IF NOT EXISTS milestone_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  estimated_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default milestone templates
INSERT INTO milestone_templates (name, description, category, estimated_days) VALUES
('Initial Setup', 'Complete initial workspace configuration and basic settings', 'setup', 1),
('Team Onboarding', 'Invite team members and grant access permissions', 'setup', 2),
('First Onboarding Call', 'Complete the first onboarding consultation call', 'consultation', 1),
('Forms Configuration', 'Set up initial forms and document templates', 'configuration', 3),
('SmartDocs Setup', 'Configure SmartDocs and document automation', 'configuration', 2),
('Zapier Integration', 'Set up Zapier workflows and automations', 'integration', 2),
('Workflow Testing', 'Test all configured workflows and automations', 'testing', 1),
('Client Training', 'Complete client training and knowledge transfer', 'training', 2),
('Go-Live Preparation', 'Final preparations before going live', 'deployment', 1),
('Launch Complete', 'Successfully launched and operational', 'deployment', 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_implementation_milestones_client_id ON implementation_milestones(client_id);
CREATE INDEX IF NOT EXISTS idx_implementation_milestones_status ON implementation_milestones(status);
CREATE INDEX IF NOT EXISTS idx_implementation_milestones_order_index ON implementation_milestones(order_index);
CREATE INDEX IF NOT EXISTS idx_milestone_templates_category ON milestone_templates(category);
CREATE INDEX IF NOT EXISTS idx_milestone_templates_active ON milestone_templates(is_active);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_implementation_milestones_updated_at ON implementation_milestones;
CREATE TRIGGER update_implementation_milestones_updated_at 
  BEFORE UPDATE ON implementation_milestones 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestone_templates_updated_at ON milestone_templates;
CREATE TRIGGER update_milestone_templates_updated_at 
  BEFORE UPDATE ON milestone_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add milestone management columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS milestones_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS milestone_road_theme VARCHAR(50) DEFAULT 'default' CHECK (milestone_road_theme IN ('default', 'mountain', 'ocean', 'forest', 'city'));

-- Create function to calculate milestone completion percentage
CREATE OR REPLACE FUNCTION calculate_milestone_completion(client_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(CASE WHEN status = 'completed' THEN 1 END)
  INTO total_milestones, completed_milestones
  FROM implementation_milestones
  WHERE client_id = client_uuid;
  
  IF total_milestones = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_milestones::DECIMAL / total_milestones::DECIMAL) * 100);
  END IF;
END;
$$ LANGUAGE plpgsql;
