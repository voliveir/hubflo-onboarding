-- Ensure all required tables exist with proper schema
-- This script creates any missing tables and is safe to run multiple times

-- Ensure clients table exists (should already exist from script 001)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    number_of_users INTEGER NOT NULL DEFAULT 0,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'pro' CHECK (plan_type IN ('pro', 'business', 'unlimited')),
    billing_type VARCHAR(50) NOT NULL DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'quarterly', 'annually')),
    success_package VARCHAR(50) NOT NULL DEFAULT 'light' CHECK (success_package IN ('light', 'premium', 'gold', 'elite')),
    revenue_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    custom_app VARCHAR(50) NOT NULL DEFAULT 'not_applicable' CHECK (custom_app IN ('gray_label', 'white_label', 'not_applicable')),
    projects_enabled BOOLEAN NOT NULL DEFAULT false,
    welcome_message TEXT,
    video_url TEXT,
    show_zapier_integrations BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    -- Project tracking fields
    calls_scheduled INTEGER DEFAULT 0,
    calls_completed INTEGER DEFAULT 0,
    forms_setup INTEGER DEFAULT 0,
    smartdocs_setup INTEGER DEFAULT 0,
    zapier_integrations_setup INTEGER DEFAULT 0,
    migration_completed BOOLEAN DEFAULT false,
    slack_access_granted BOOLEAN DEFAULT false,
    project_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure integrations table exists
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('zapier', 'native', 'api')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[],
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure client_integrations table exists
CREATE TABLE IF NOT EXISTS client_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
    integration_type VARCHAR(50) CHECK (integration_type IN ('zapier', 'native', 'api')),
    title VARCHAR(255),
    description TEXT,
    url TEXT,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT client_integrations_data_check 
    CHECK (
        (integration_id IS NOT NULL) OR 
        (integration_type IS NOT NULL AND title IS NOT NULL AND url IS NOT NULL)
    )
);

-- Ensure client_checklist table exists
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

-- Ensure platform_settings table exists
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_integrations_tags ON integrations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id ON client_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_integrations_type ON client_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_client_integrations_featured ON client_integrations(is_featured);
CREATE INDEX IF NOT EXISTS idx_client_integrations_sort ON client_integrations(sort_order);
CREATE INDEX IF NOT EXISTS idx_client_checklist_client_id ON client_checklist(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checklist_category ON client_checklist(category);
CREATE INDEX IF NOT EXISTS idx_client_checklist_completed ON client_checklist(is_completed);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON platform_settings(is_public);
