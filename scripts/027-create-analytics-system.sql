-- Create analytics system for Hubflo onboarding platform
-- This script creates tables to track comprehensive analytics and conversion metrics

-- Analytics Events Table - Track all user interactions and stage transitions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100) NOT NULL,
    event_data JSONB,
    stage_from VARCHAR(100),
    stage_to VARCHAR(100),
    package_type VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Journey Analytics - Track time spent in each stage
CREATE TABLE IF NOT EXISTS client_journey_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    stage_completed_at TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    duration_hours INTEGER,
    is_completed BOOLEAN DEFAULT false,
    completion_reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion Tracking - Track conversion rates by package and stage
CREATE TABLE IF NOT EXISTS conversion_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_type VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    clients_entered INTEGER DEFAULT 0,
    clients_completed INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    avg_duration_days DECIMAL(5,2),
    avg_duration_hours DECIMAL(5,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_type, stage_name, period_start, period_end)
);

-- Integration Adoption Metrics
CREATE TABLE IF NOT EXISTS integration_adoption_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    integration_name VARCHAR(255) NOT NULL,
    integration_category VARCHAR(100),
    package_type VARCHAR(50),
    total_offered INTEGER DEFAULT 0,
    total_adopted INTEGER DEFAULT 0,
    adoption_rate DECIMAL(5,2),
    avg_setup_time_hours DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(integration_id, package_type, period_start, period_end)
);

-- Feature Usage Statistics
CREATE TABLE IF NOT EXISTS feature_usage_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    feature_category VARCHAR(100),
    package_type VARCHAR(50),
    total_enabled INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    usage_rate DECIMAL(5,2),
    avg_usage_frequency DECIMAL(5,2),
    user_satisfaction_score DECIMAL(3,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, package_type, period_start, period_end)
);

-- Revenue Impact Tracking
CREATE TABLE IF NOT EXISTS revenue_impact_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_type VARCHAR(50) NOT NULL,
    revenue_source VARCHAR(100) NOT NULL,
    base_revenue DECIMAL(10,2),
    additional_revenue DECIMAL(10,2),
    total_revenue DECIMAL(10,2),
    client_count INTEGER,
    avg_revenue_per_client DECIMAL(10,2),
    revenue_growth_rate DECIMAL(5,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_type, revenue_source, period_start, period_end)
);

-- Client Satisfaction Scores
CREATE TABLE IF NOT EXISTS client_satisfaction_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    survey_type VARCHAR(100) NOT NULL,
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
    onboarding_experience INTEGER CHECK (onboarding_experience >= 1 AND onboarding_experience <= 5),
    implementation_support INTEGER CHECK (implementation_support >= 1 AND implementation_support <= 5),
    feature_satisfaction INTEGER CHECK (feature_satisfaction >= 1 AND feature_satisfaction <= 5),
    integration_satisfaction INTEGER CHECK (integration_satisfaction >= 1 AND integration_satisfaction <= 5),
    would_recommend INTEGER CHECK (would_recommend >= 1 AND would_recommend <= 5),
    nps_score INTEGER CHECK (nps_score >= -100 AND nps_score <= 100),
    feedback_text TEXT,
    survey_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Dashboard Cache - For performance optimization
CREATE TABLE IF NOT EXISTS analytics_dashboard_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_package_type ON analytics_events(package_type);

CREATE INDEX IF NOT EXISTS idx_client_journey_client_id ON client_journey_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_journey_stage_name ON client_journey_analytics(stage_name);
CREATE INDEX IF NOT EXISTS idx_client_journey_completed ON client_journey_analytics(is_completed);

CREATE INDEX IF NOT EXISTS idx_conversion_tracking_package ON conversion_tracking(package_type);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_stage ON conversion_tracking(stage_name);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_period ON conversion_tracking(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_integration_adoption_integration ON integration_adoption_metrics(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_adoption_package ON integration_adoption_metrics(package_type);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage_statistics(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_package ON feature_usage_statistics(package_type);

CREATE INDEX IF NOT EXISTS idx_revenue_impact_package ON revenue_impact_tracking(package_type);
CREATE INDEX IF NOT EXISTS idx_revenue_impact_period ON revenue_impact_tracking(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_satisfaction_client ON client_satisfaction_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_survey_type ON client_satisfaction_scores(survey_type);
CREATE INDEX IF NOT EXISTS idx_satisfaction_date ON client_satisfaction_scores(survey_date);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_dashboard_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_dashboard_cache(expires_at);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_journey_analytics_updated_at 
    BEFORE UPDATE ON client_journey_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_tracking_updated_at 
    BEFORE UPDATE ON conversion_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_adoption_metrics_updated_at 
    BEFORE UPDATE ON integration_adoption_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_usage_statistics_updated_at 
    BEFORE UPDATE ON feature_usage_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_impact_tracking_updated_at 
    BEFORE UPDATE ON revenue_impact_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample analytics data for demonstration
INSERT INTO analytics_events (client_id, event_type, event_category, event_data, stage_from, stage_to, package_type)
SELECT 
    c.id,
    'stage_transition',
    'onboarding',
    jsonb_build_object('previous_stage', 'new', 'new_stage', 'first_call', 'transition_reason', 'scheduled'),
    'new',
    'first_call',
    c.success_package
FROM clients c 
WHERE c.status = 'active' 
LIMIT 10;

-- Insert sample client journey data
INSERT INTO client_journey_analytics (client_id, stage_name, stage_started_at, stage_completed_at, duration_days, is_completed)
SELECT 
    c.id,
    'new',
    c.created_at,
    c.created_at + INTERVAL '2 days',
    2,
    true
FROM clients c 
WHERE c.status = 'active' 
LIMIT 5;

-- Insert sample conversion tracking data
INSERT INTO conversion_tracking (package_type, stage_name, clients_entered, clients_completed, conversion_rate, avg_duration_days, period_start, period_end)
VALUES 
    ('premium', 'new', 25, 23, 92.00, 2.5, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('premium', 'first_call', 23, 20, 86.96, 3.2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('premium', 'second_call', 20, 18, 90.00, 4.1, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('premium', 'graduation', 18, 16, 88.89, 5.3, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('elite', 'new', 8, 8, 100.00, 1.8, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('elite', 'configurations', 8, 7, 87.50, 4.5, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('elite', 'integrations', 7, 6, 85.71, 6.2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE),
    ('elite', 'graduation', 6, 5, 83.33, 8.1, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Insert sample satisfaction scores
INSERT INTO client_satisfaction_scores (client_id, survey_type, overall_satisfaction, onboarding_experience, implementation_support, feature_satisfaction, integration_satisfaction, would_recommend, nps_score, feedback_text, survey_date)
SELECT 
    c.id,
    'onboarding_completion',
    4 + (random() * 2)::integer,
    4 + (random() * 2)::integer,
    4 + (random() * 2)::integer,
    4 + (random() * 2)::integer,
    4 + (random() * 2)::integer,
    4 + (random() * 2)::integer,
    50 + (random() * 40)::integer,
    'Great onboarding experience! The team was very helpful.',
    CURRENT_DATE - (random() * 30)::integer * INTERVAL '1 day'
FROM clients c 
WHERE c.status = 'active' 
LIMIT 15; 