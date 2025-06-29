-- Insert sample clients for testing
INSERT INTO clients (
    name, 
    slug, 
    success_package, 
    billing_type, 
    plan_type, 
    revenue_amount, 
    custom_app, 
    calls_scheduled,
    calls_completed,
    forms_setup,
    smartdocs_setup,
    zapier_integrations_setup,
    migration_completed,
    slack_access_granted,
    project_completion_percentage,
    status
) VALUES 
(
    'Acme Corporation', 
    'acme-corp', 
    'premium', 
    'monthly', 
    'pro', 
    5000, 
    'not_applicable',
    2,
    1,
    1,
    0,
    1,
    false,
    false,
    40,
    'active'
),
(
    'TechStart Inc', 
    'techstart-inc', 
    'gold', 
    'yearly', 
    'pro', 
    12000, 
    'not_applicable',
    3,
    2,
    2,
    1,
    2,
    false,
    false,
    65,
    'active'
),
(
    'Global Solutions LLC', 
    'global-solutions', 
    'elite', 
    'yearly', 
    'enterprise', 
    25000, 
    'custom_built',
    5,
    3,
    4,
    3,
    5,
    true,
    true,
    85,
    'active'
),
(
    'StartupXYZ', 
    'startup-xyz', 
    'light', 
    'monthly', 
    'starter', 
    1500, 
    'not_applicable',
    1,
    0,
    0,
    0,
    0,
    false,
    false,
    10,
    'draft'
),
(
    'Enterprise Corp', 
    'enterprise-corp', 
    'enterprise', 
    'yearly', 
    'enterprise', 
    50000, 
    'custom_built',
    10,
    8,
    10,
    8,
    15,
    true,
    true,
    95,
    'active'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (
    name, 
    slug, 
    logo_url, 
    number_of_users, 
    plan_type, 
    billing_type, 
    success_package, 
    revenue_amount, 
    custom_app, 
    projects_enabled, 
    welcome_message, 
    video_url, 
    show_zapier_integrations, 
    notes, 
    status
) VALUES 
(
    'Acme Corporation', 
    'acme-corp', 
    '/placeholder.svg?height=100&width=100', 
    150, 
    'business', 
    'annually', 
    'premium', 
    50000.00, 
    'white_label', 
    true, 
    'Welcome to Acme Corporation! We''re excited to help you streamline your business processes with our comprehensive platform.', 
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    true, 
    'High-value client with complex integration needs', 
    'active'
),
(
    'TechStart Inc', 
    'techstart', 
    '/placeholder.svg?height=100&width=100', 
    25, 
    'pro', 
    'monthly', 
    'light', 
    5000.00, 
    'gray_label', 
    false, 
    'Welcome to TechStart! Let''s get your team up and running quickly.', 
    null, 
    true, 
    'Startup client, price-sensitive', 
    'active'
),
(
    'Global Enterprises', 
    'global-ent', 
    '/placeholder.svg?height=100&width=100', 
    500, 
    'unlimited', 
    'annually', 
    'elite', 
    150000.00, 
    'white_label', 
    true, 
    'Welcome to Global Enterprises. Our enterprise-grade solution is tailored for your organization''s scale and complexity.', 
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    false, 
    'Enterprise client with custom requirements', 
    'active'
),
(
    'Beta Testing Co', 
    'beta-test', 
    '/placeholder.svg?height=100&width=100', 
    10, 
    'pro', 
    'monthly', 
    'premium', 
    2500.00, 
    'not_applicable', 
    true, 
    'Welcome to our beta program! Help us shape the future of our platform.', 
    null, 
    true, 
    'Beta testing client - handle with care', 
    'draft'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample project tasks
INSERT INTO project_tasks (client_id, title, description, status, priority, due_date) 
SELECT 
    c.id,
    'Initial Discovery Call',
    'Conduct initial discovery call to understand client needs and requirements',
    'completed',
    'high',
    NOW() - INTERVAL '7 days'
FROM clients c WHERE c.slug = 'acme-corp'
UNION ALL
SELECT 
    c.id,
    'Setup Client Portal',
    'Configure and customize the client portal with branding and initial content',
    'in_progress',
    'high',
    NOW() + INTERVAL '3 days'
FROM clients c WHERE c.slug = 'acme-corp'
UNION ALL
SELECT 
    c.id,
    'Configure Zapier Integration',
    'Set up HubSpot to Hubflo integration via Zapier',
    'pending',
    'medium',
    NOW() + INTERVAL '7 days'
FROM clients c WHERE c.slug = 'acme-corp';

-- Insert sample checklist items
INSERT INTO client_checklists (client_id, title, description, is_completed, completed_at)
SELECT 
    c.id,
    'Welcome Email Sent',
    'Initial welcome email with portal access sent to client',
    true,
    NOW() - INTERVAL '5 days'
FROM clients c WHERE c.slug = 'acme-corp'
UNION ALL
SELECT 
    c.id,
    'Branding Assets Collected',
    'Client logo and brand colors collected and uploaded',
    true,
    NOW() - INTERVAL '3 days'
FROM clients c WHERE c.slug = 'acme-corp'
UNION ALL
SELECT 
    c.id,
    'First Form Created',
    'Initial client intake form created and configured',
    false,
    NULL
FROM clients c WHERE c.slug = 'acme-corp';
