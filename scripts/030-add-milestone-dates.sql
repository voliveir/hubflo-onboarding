-- Add milestone date fields for each package type
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS light_onboarding_call_date DATE,
ADD COLUMN IF NOT EXISTS premium_first_call_date DATE,
ADD COLUMN IF NOT EXISTS premium_second_call_date DATE,
ADD COLUMN IF NOT EXISTS gold_first_call_date DATE,
ADD COLUMN IF NOT EXISTS gold_second_call_date DATE,
ADD COLUMN IF NOT EXISTS gold_third_call_date DATE,
ADD COLUMN IF NOT EXISTS elite_configurations_started_date DATE,
ADD COLUMN IF NOT EXISTS elite_integrations_started_date DATE,
ADD COLUMN IF NOT EXISTS elite_verification_completed_date DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_light_onboarding_call_date ON clients(light_onboarding_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_premium_first_call_date ON clients(premium_first_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_premium_second_call_date ON clients(premium_second_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_gold_first_call_date ON clients(gold_first_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_gold_second_call_date ON clients(gold_second_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_gold_third_call_date ON clients(gold_third_call_date);
CREATE INDEX IF NOT EXISTS idx_clients_elite_configurations_started_date ON clients(elite_configurations_started_date);
CREATE INDEX IF NOT EXISTS idx_clients_elite_integrations_started_date ON clients(elite_integrations_started_date);
CREATE INDEX IF NOT EXISTS idx_clients_elite_verification_completed_date ON clients(elite_verification_completed_date); 