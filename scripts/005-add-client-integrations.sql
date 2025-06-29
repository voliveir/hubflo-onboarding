-- Create integrations table (master list of available integrations)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('zapier', 'native', 'api')),
  external_url TEXT,
  documentation_url TEXT,
  icon_url TEXT,
  setup_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured_by_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_integrations table (which integrations each client has access to)
CREATE TABLE IF NOT EXISTS client_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('zapier', 'native', 'api')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id ON client_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_integrations_type ON client_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_client_integrations_featured ON client_integrations(is_featured);
CREATE INDEX IF NOT EXISTS idx_client_integrations_sort ON client_integrations(sort_order);

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at 
  BEFORE UPDATE ON integrations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_client_integrations_updated_at 
    BEFORE UPDATE ON client_integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert comprehensive sample integrations
INSERT INTO integrations (title, description, category, integration_type, external_url, documentation_url, setup_instructions) VALUES
-- CRM & Sales
('HubSpot CRM Integration', 'Sync contacts, deals, and project data with HubSpot CRM', 'CRM', 'zapier', 'https://zapier.com/apps/hubspot/integrations/hubflo', 'https://docs.hubflo.com/integrations/hubspot', 'Connect your HubSpot account and configure which data to sync between platforms.'),
('Salesforce Integration', 'Automatically create opportunities and update records in Salesforce', 'CRM', 'zapier', 'https://zapier.com/apps/salesforce/integrations/hubflo', 'https://docs.hubflo.com/integrations/salesforce', 'Authenticate with Salesforce and map your fields for seamless data flow.'),
('Pipedrive Integration', 'Sync deals and contacts between Pipedrive and Hubflo', 'CRM', 'zapier', 'https://zapier.com/apps/pipedrive/integrations/hubflo', 'https://docs.hubflo.com/integrations/pipedrive', 'Connect Pipedrive and set up automated deal creation workflows.'),

-- Forms & Lead Generation
('Typeform Integration', 'Create Hubflo projects from Typeform submissions', 'Forms', 'zapier', 'https://zapier.com/apps/typeform/integrations/hubflo', 'https://docs.hubflo.com/integrations/typeform', 'Link your Typeform account and configure project creation triggers.'),
('Gravity Forms Integration', 'WordPress form submissions automatically create Hubflo projects', 'Forms', 'zapier', 'https://zapier.com/apps/gravity-forms/integrations/hubflo', 'https://docs.hubflo.com/integrations/gravity-forms', 'Set up webhooks in Gravity Forms to trigger Hubflo project creation.'),
('JotForm Integration', 'Convert JotForm submissions into Hubflo projects and tasks', 'Forms', 'zapier', 'https://zapier.com/apps/jotform/integrations/hubflo', 'https://docs.hubflo.com/integrations/jotform', 'Configure JotForm webhooks to automatically create projects in Hubflo.'),

-- Communication
('Slack Notifications', 'Get real-time project updates and notifications in Slack', 'Communication', 'zapier', 'https://zapier.com/apps/slack/integrations/hubflo', 'https://docs.hubflo.com/integrations/slack', 'Install the Hubflo Slack app and configure notification preferences.'),
('Microsoft Teams Integration', 'Receive project updates and collaborate through Teams', 'Communication', 'zapier', 'https://zapier.com/apps/microsoft-teams/integrations/hubflo', 'https://docs.hubflo.com/integrations/teams', 'Add Hubflo connector to your Teams workspace and set up channels.'),
('Discord Notifications', 'Get project notifications in your Discord server', 'Communication', 'zapier', 'https://zapier.com/apps/discord/integrations/hubflo', 'https://docs.hubflo.com/integrations/discord', 'Create a Discord webhook and configure Hubflo to send updates.'),

-- Email Marketing
('Mailchimp Integration', 'Add completed clients to Mailchimp email campaigns', 'Marketing', 'zapier', 'https://zapier.com/apps/mailchimp/integrations/hubflo', 'https://docs.hubflo.com/integrations/mailchimp', 'Connect Mailchimp and set up audience segmentation based on project status.'),
('ConvertKit Integration', 'Automatically tag and segment clients in ConvertKit', 'Marketing', 'zapier', 'https://zapier.com/apps/convertkit/integrations/hubflo', 'https://docs.hubflo.com/integrations/convertkit', 'Link ConvertKit account and configure tagging rules for different project stages.'),
('ActiveCampaign Integration', 'Sync client data and trigger email sequences', 'Marketing', 'zapier', 'https://zapier.com/apps/activecampaign/integrations/hubflo', 'https://docs.hubflo.com/integrations/activecampaign', 'Connect ActiveCampaign and set up automation triggers based on project milestones.'),

-- Accounting & Finance
('QuickBooks Integration', 'Sync invoicing and payment data with QuickBooks', 'Accounting', 'zapier', 'https://zapier.com/apps/quickbooks/integrations/hubflo', 'https://docs.hubflo.com/integrations/quickbooks', 'Authenticate with QuickBooks and configure invoice and payment sync settings.'),
('Xero Integration', 'Automatically create invoices and track payments in Xero', 'Accounting', 'zapier', 'https://zapier.com/apps/xero/integrations/hubflo', 'https://docs.hubflo.com/integrations/xero', 'Connect your Xero account and set up automated invoice generation workflows.'),
('FreshBooks Integration', 'Sync project data and create invoices in FreshBooks', 'Accounting', 'zapier', 'https://zapier.com/apps/freshbooks/integrations/hubflo', 'https://docs.hubflo.com/integrations/freshbooks', 'Link FreshBooks and configure project-to-invoice automation.'),

-- Scheduling
('Calendly Integration', 'Create projects when Calendly appointments are booked', 'Scheduling', 'zapier', 'https://zapier.com/apps/calendly/integrations/hubflo', 'https://docs.hubflo.com/integrations/calendly', 'Connect Calendly and set up project creation triggers for new bookings.'),
('Acuity Scheduling Integration', 'Automatically create projects from Acuity appointments', 'Scheduling', 'zapier', 'https://zapier.com/apps/acuity-scheduling/integrations/hubflo', 'https://docs.hubflo.com/integrations/acuity', 'Link Acuity account and configure appointment-to-project workflows.'),

-- Reporting & Analytics
('Google Sheets Integration', 'Export project data and reports to Google Sheets', 'Reporting', 'zapier', 'https://zapier.com/apps/google-sheets/integrations/hubflo', 'https://docs.hubflo.com/integrations/google-sheets', 'Authorize Google Sheets access and set up automated data export schedules.'),
('Airtable Integration', 'Sync project data with Airtable databases', 'Reporting', 'zapier', 'https://zapier.com/apps/airtable/integrations/hubflo', 'https://docs.hubflo.com/integrations/airtable', 'Connect Airtable and configure base synchronization settings.'),

-- Native Hubflo Features
('Native Calendar System', 'Built-in calendar for scheduling and deadline management', 'Scheduling', 'native', '/calendar', 'https://docs.hubflo.com/features/calendar', 'Access the calendar feature directly in your Hubflo dashboard.'),
('Document Templates', 'Pre-built templates for contracts, proposals, and agreements', 'Documents', 'native', '/documents/templates', 'https://docs.hubflo.com/features/documents', 'Browse and customize document templates in the Templates section.'),
('Client Portal', 'Branded client portal for project collaboration and updates', 'Client Management', 'native', '/client-portal', 'https://docs.hubflo.com/features/client-portal', 'Configure your client portal settings and branding options.'),
('Time Tracking', 'Built-in time tracking for projects and tasks', 'Productivity', 'native', '/time-tracking', 'https://docs.hubflo.com/features/time-tracking', 'Enable time tracking in your project settings and start logging hours.'),

-- Developer & API
('REST API Access', 'Full REST API for custom integrations and development', 'Developer', 'api', null, 'https://docs.hubflo.com/api', 'Generate API keys in your account settings and review the API documentation.'),
('Webhook System', 'Send real-time data to external systems via webhooks', 'Developer', 'api', null, 'https://docs.hubflo.com/api/webhooks', 'Configure webhook endpoints in your integration settings.'),
('Custom Zapier App', 'Build custom Zapier integrations with Hubflo', 'Developer', 'zapier', 'https://zapier.com/developer/public-invite/hubflo', 'https://docs.hubflo.com/integrations/custom-zapier', 'Use Zapier Developer Platform to create custom Hubflo integrations.');

-- Insert sample client integration data
INSERT INTO client_integrations (client_id, integration_type, title, description, url, icon_name, category, is_featured, sort_order) VALUES
('client1-id', 'zapier', 'Salesforce CRM', 'Automatically create opportunities and update records in Salesforce', 'https://zapier.com/apps/salesforce/integrations/hubflo', 'salesforce-icon', 'CRM', TRUE, 1),
('client1-id', 'zapier', 'HubSpot Marketing', 'Add completed clients to Mailchimp email campaigns', 'https://zapier.com/apps/mailchimp/integrations/hubflo', 'mailchimp-icon', 'Marketing', FALSE, 2),
('client1-id', 'api', 'Stripe Payments', 'Process payments through Stripe', 'https://stripe.com/docs', 'stripe-icon', 'Payment Processing', FALSE, 3),
('client2-id', 'zapier', 'Pipedrive CRM', 'Sync deals and contacts between Pipedrive and Hubflo', 'https://zapier.com/apps/pipedrive/integrations/hubflo', 'pipedrive-icon', 'CRM', TRUE, 1),
('client2-id', 'zapier', 'Mailchimp', 'Automatically tag and segment clients in ConvertKit', 'https://zapier.com/apps/convertkit/integrations/hubflo', 'convertkit-icon', 'Email Marketing', FALSE, 2),
('client4-id', 'zapier', 'Salesforce CRM', 'Automatically create opportunities and update records in Salesforce', 'https://zapier.com/apps/salesforce/integrations/hubflo', 'salesforce-icon', 'CRM', TRUE, 1),
('client4-id', 'zapier', 'Marketo', 'Sync client data and trigger email sequences', 'https://zapier.com/apps/marketo/integrations/hubflo', 'marketo-icon', 'Marketing Automation', TRUE, 2),
('client4-id', 'api', 'PayPal', 'Process payments through PayPal', 'https://paypal.com/developer', 'paypal-icon', 'Payment Processing', FALSE, 3)
ON CONFLICT DO NOTHING;
