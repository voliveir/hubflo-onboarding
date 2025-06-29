-- Create platform_settings table for global configuration
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be accessed by clients
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on setting_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON platform_settings(is_public);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_platform_settings_updated_at 
    BEFORE UPDATE ON platform_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('platform_name', 'Hubflo Onboarding Platform', 'string', 'The name of the platform displayed to users', true),
('support_email', 'support@hubflo.com', 'string', 'Email address for customer support', true),
('default_welcome_message', 'Welcome to our platform! We''re excited to help you get started.', 'string', 'Default welcome message for new clients', false),
('max_integrations_per_client', '50', 'number', 'Maximum number of integrations allowed per client', false),
('enable_zapier_integrations', 'true', 'boolean', 'Whether Zapier integrations are enabled globally', false),
('platform_logo_url', '/placeholder.svg?height=50&width=150', 'string', 'URL to the platform logo', true)
ON CONFLICT (setting_key) DO NOTHING;
