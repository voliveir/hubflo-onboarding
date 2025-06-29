-- Create clients table with all necessary fields
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    number_of_users INTEGER NOT NULL DEFAULT 0,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('pro', 'business', 'unlimited')),
    billing_type VARCHAR(50) NOT NULL CHECK (billing_type IN ('monthly', 'quarterly', 'annually')),
    success_package VARCHAR(50) NOT NULL CHECK (success_package IN ('light', 'premium', 'gold', 'elite')),
    revenue_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    custom_app VARCHAR(50) NOT NULL CHECK (custom_app IN ('gray_label', 'white_label', 'not_applicable')),
    projects_enabled BOOLEAN NOT NULL DEFAULT false,
    welcome_message TEXT,
    video_url TEXT,
    show_zapier_integrations BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
