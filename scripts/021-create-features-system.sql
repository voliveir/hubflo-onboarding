-- Create features table for managing upcoming/released features
CREATE TABLE IF NOT EXISTS features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'General',
    feature_type VARCHAR(50) DEFAULT 'feature' CHECK (feature_type IN ('feature', 'integration', 'tool', 'service')),
    status VARCHAR(50) DEFAULT 'development' CHECK (status IN ('development', 'beta', 'released', 'deprecated')),
    release_date TIMESTAMP WITH TIME ZONE,
    estimated_release_date TIMESTAMP WITH TIME ZONE,
    pricing_tier VARCHAR(50) DEFAULT 'free' CHECK (pricing_tier IN ('free', 'premium', 'enterprise', 'addon')),
    pricing_amount DECIMAL(10,2),
    icon_name VARCHAR(100),
    icon_url TEXT,
    demo_url TEXT,
    documentation_url TEXT,
    video_url TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_upsell_eligible BOOLEAN DEFAULT true,
    target_packages TEXT[] DEFAULT '{}',
    sales_notes TEXT,
    implementation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_features table for tracking feature assignments to clients
CREATE TABLE IF NOT EXISTS client_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'proposed' CHECK (status IN ('proposed', 'interested', 'approved', 'implementing', 'completed', 'declined')),
    is_enabled BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 1,
    proposed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    implementation_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    pricing_override DECIMAL(10,2),
    custom_notes TEXT,
    sales_person VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, feature_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);
CREATE INDEX IF NOT EXISTS idx_features_category ON features(category);
CREATE INDEX IF NOT EXISTS idx_features_is_active ON features(is_active);
CREATE INDEX IF NOT EXISTS idx_client_features_client_id ON client_features(client_id);
CREATE INDEX IF NOT EXISTS idx_client_features_status ON client_features(status);

-- Insert some sample features
INSERT INTO features (title, description, category, feature_type, status, estimated_release_date, pricing_tier, pricing_amount, target_packages, sales_notes, is_upsell_eligible) VALUES
('AI Agents', 'Intelligent automation agents that can handle complex workflows and decision-making processes', 'AI & Automation', 'feature', 'development', '2024-03-15', 'premium', 299.00, '{"premium", "gold", "elite"}', 'Great for clients who mentioned wanting more automation during sales calls', true),
('Advanced Reporting Dashboard', 'Comprehensive analytics and reporting with custom dashboards and data visualization', 'Analytics', 'feature', 'beta', '2024-02-01', 'enterprise', 199.00, '{"gold", "elite"}', 'Perfect upsell for data-driven clients', true),
('White Label Mobile App', 'Custom branded mobile app for your clients with your logo and branding', 'Branding', 'service', 'released', NOW(), 'addon', 2999.00, '{"premium", "gold", "elite"}', 'High-value upsell for agencies and consultants', true),
('API Access & Webhooks', 'Full API access with webhook integrations for custom development', 'Developer Tools', 'feature', 'released', NOW(), 'enterprise', 99.00, '{"elite"}', 'Technical clients who need custom integrations', true),
('Priority Support Channel', '24/7 priority support with dedicated account manager', 'Support', 'service', 'released', NOW(), 'premium', 149.00, '{"premium", "gold", "elite"}', 'Great for clients who value support', true),
('Custom Integrations', 'Bespoke integrations built specifically for your business needs', 'Integrations', 'service', 'development', '2024-04-01', 'addon', 1999.00, '{"gold", "elite"}', 'For clients with unique integration requirements', true);

-- Add some sample client feature assignments (you can remove these after testing)
-- Note: Replace the client_id values with actual client IDs from your database
-- INSERT INTO client_features (client_id, feature_id, status, sales_person, custom_notes) 
-- SELECT 
--     c.id as client_id,
--     f.id as feature_id,
--     'proposed' as status,
--     'Demo Sales Person' as sales_person,
--     'Mentioned interest during onboarding call' as custom_notes
-- FROM clients c, features f 
-- WHERE c.slug = 'demo-client' AND f.title = 'AI Agents'
-- LIMIT 1;
