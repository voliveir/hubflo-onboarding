-- This script creates the master integrations system
-- It should be run after script 005 which creates the basic integration tables

-- Create master integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('zapier', 'native', 'api')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[], -- Array of tags for better categorization
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_integrations_tags ON integrations USING GIN(tags);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample master integrations
INSERT INTO integrations (integration_type, title, description, url, icon_name, category, tags, is_active) VALUES
('zapier', 'Gmail Integration', 'Connect your Gmail account to automate email workflows', 'https://zapier.com/apps/gmail/integrations', 'Mail', 'Email', ARRAY['email', 'communication', 'google'], true),
('zapier', 'Slack Integration', 'Integrate with Slack for team communication and notifications', 'https://zapier.com/apps/slack/integrations', 'MessageSquare', 'Communication', ARRAY['chat', 'team', 'notifications'], true),
('zapier', 'Google Sheets Integration', 'Sync data with Google Sheets for easy reporting', 'https://zapier.com/apps/google-sheets/integrations', 'FileSpreadsheet', 'Productivity', ARRAY['spreadsheet', 'data', 'google'], true),
('zapier', 'Trello Integration', 'Connect with Trello for project management', 'https://zapier.com/apps/trello/integrations', 'Trello', 'Project Management', ARRAY['tasks', 'boards', 'project'], true),
('zapier', 'HubSpot Integration', 'Integrate with HubSpot CRM for sales and marketing', 'https://zapier.com/apps/hubspot/integrations', 'Users', 'CRM', ARRAY['crm', 'sales', 'marketing'], true),
('native', 'Salesforce Connector', 'Native integration with Salesforce CRM', 'https://salesforce.com', 'Database', 'CRM', ARRAY['crm', 'sales', 'enterprise'], true),
('api', 'Custom API Integration', 'Build custom integrations using our REST API', 'https://api.example.com/docs', 'Code', 'Development', ARRAY['api', 'custom', 'development'], true),
('zapier', 'Mailchimp Integration', 'Connect with Mailchimp for email marketing', 'https://zapier.com/apps/mailchimp/integrations', 'Mail', 'Marketing', ARRAY['email', 'marketing', 'campaigns'], true),
('zapier', 'Asana Integration', 'Integrate with Asana for task and project management', 'https://zapier.com/apps/asana/integrations', 'CheckSquare', 'Project Management', ARRAY['tasks', 'project', 'team'], true),
('zapier', 'Zoom Integration', 'Connect with Zoom for video conferencing automation', 'https://zapier.com/apps/zoom/integrations', 'Video', 'Communication', ARRAY['video', 'meetings', 'conferencing'], true)
ON CONFLICT (title) DO NOTHING;

-- Update the integrations table to ensure it has all the fields we need
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS setup_instructions TEXT,
ADD COLUMN IF NOT EXISTS is_featured_by_default BOOLEAN DEFAULT false;

-- Insert additional sample integrations with more variety
INSERT INTO integrations (title, description, category, integration_type, url, documentation_url, setup_instructions) VALUES
('Google Sheets Integration', 'Automatically export client data and project reports to Google Sheets', 'Reporting', 'zapier', 'https://zapier.com/apps/hubflo/integrations/google-sheets', 'https://docs.hubflo.com/integrations/google-sheets', 'Connect your Google account and select the spreadsheet where you want to export data.'),
('QuickBooks Integration', 'Sync invoicing and payment data with QuickBooks', 'Accounting', 'zapier', 'https://zapier.com/apps/hubflo/integrations/quickbooks', 'https://docs.hubflo.com/integrations/quickbooks', 'Connect your QuickBooks account and configure which data to sync.'),
('Microsoft Teams Notifications', 'Get project updates and notifications in Microsoft Teams', 'Communication', 'zapier', 'https://zapier.com/apps/hubflo/integrations/microsoft-teams', 'https://docs.hubflo.com/integrations/teams', 'Add the Hubflo connector to your Teams workspace.'),
('Calendly Integration', 'Automatically create projects when Calendly appointments are booked', 'Scheduling', 'zapier', 'https://zapier.com/apps/calendly/integrations/hubflo', 'https://docs.hubflo.com/integrations/calendly', 'Connect your Calendly account and set up the trigger for new bookings.'),
('Custom Webhook Integration', 'Send data to any external system using webhooks', 'Developer', 'api', null, 'https://docs.hubflo.com/api/webhooks', 'Configure webhook endpoints in your Hubflo settings to send data to external systems.'),
('Native Document Templates', 'Built-in document template system for contracts and proposals', 'Documents', 'native', '/documents/templates', 'https://docs.hubflo.com/features/documents', 'Access the document templates section in your Hubflo dashboard to create and customize templates.')
ON CONFLICT (title) DO NOTHING;

-- Create some sample client integration assignments for variety
-- Remove existing assignments first to avoid conflicts
DELETE FROM client_integrations WHERE client_id IN (
  SELECT id FROM clients WHERE slug IN ('triumph-law', 'techstart', 'green-valley')
);

-- Assign integrations based on client packages and needs
INSERT INTO client_integrations (client_id, integration_id, is_featured, sort_order)
SELECT 
  c.id as client_id,
  i.id as integration_id,
  CASE 
    -- Featured integrations based on client type and package
    WHEN c.slug = 'triumph-law' AND i.title IN ('Zapier Forms Integration', 'CRM Sync', 'Native Document Templates') THEN true
    WHEN c.slug = 'techstart' AND i.title IN ('Slack Notifications', 'Google Sheets Integration', 'API Access') THEN true
    WHEN c.slug = 'green-valley' AND i.title IN ('Zapier Forms Integration', 'Email Marketing Integration') THEN true
    ELSE false
  END as is_featured,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY 
    CASE 
      -- Sort featured items first
      WHEN c.slug = 'triumph-law' AND i.title IN ('Zapier Forms Integration', 'CRM Sync', 'Native Document Templates') THEN 1
      WHEN c.slug = 'techstart' AND i.title IN ('Slack Notifications', 'Google Sheets Integration', 'API Access') THEN 1
      WHEN c.slug = 'green-valley' AND i.title IN ('Zapier Forms Integration', 'Email Marketing Integration') THEN 1
      ELSE 2
    END,
    i.title
  ) as sort_order
FROM clients c
CROSS JOIN integrations i
WHERE 
  c.slug IN ('triumph-law', 'techstart', 'green-valley')
  AND i.is_active = true
  AND (
    -- Triumph Law (Premium package) - Legal focus
    (c.slug = 'triumph-law' AND i.title IN (
      'Zapier Forms Integration', 'CRM Sync', 'Native Document Templates', 
      'Email Marketing Integration', 'Calendly Integration'
    ))
    OR
    -- TechStart (Gold package) - Tech startup focus  
    (c.slug = 'techstart' AND i.title IN (
      'Slack Notifications', 'Google Sheets Integration', 'API Access',
      'Custom Webhook Integration', 'Microsoft Teams Notifications', 'QuickBooks Integration'
    ))
    OR
    -- Green Valley (Light package) - Basic integrations only
    (c.slug = 'green-valley' AND i.title IN (
      'Zapier Forms Integration', 'Email Marketing Integration', 'Native Calendar Integration'
    ))
  );

-- Update client settings to show integrations for appropriate packages
UPDATE clients 
SET show_zapier_integrations = true 
WHERE success_package IN ('premium', 'gold', 'elite');

UPDATE clients 
SET show_zapier_integrations = false 
WHERE success_package = 'light';
