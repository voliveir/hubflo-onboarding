-- Add new fields to clients table for plan and billing information
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'pro' CHECK (plan_type IN ('pro', 'business', 'unlimited')),
ADD COLUMN IF NOT EXISTS billing_type VARCHAR(50) DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'quarterly', 'annually')),
ADD COLUMN IF NOT EXISTS billing_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS billing_frequency TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS annual_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS setup_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT TRUE;

-- Update existing clients with some sample data
UPDATE clients 
SET 
  plan_type = CASE 
    WHEN success_package = 'light' THEN 'pro'
    WHEN success_package = 'premium' THEN 'business'
    WHEN success_package = 'gold' THEN 'business'
    WHEN success_package = 'elite' THEN 'unlimited'
    WHEN success_package = 'growth' THEN 'growth'
    ELSE 'business'
  END,
  billing_type = CASE 
    WHEN success_package = 'light' THEN 'monthly'
    WHEN success_package = 'premium' THEN 'quarterly'
    WHEN success_package = 'gold' THEN 'quarterly'
    WHEN success_package = 'elite' THEN 'annually'
    ELSE 'monthly'
  END,
  billing_amount = CASE 
    WHEN success_package = 'light' THEN 99.00
    WHEN success_package = 'premium' THEN 299.00
    WHEN success_package = 'gold' THEN 599.00
    WHEN success_package = 'elite' THEN 1299.00
    ELSE 299.00
  END,
  billing_frequency = CASE 
    WHEN success_package = 'light' THEN 'monthly'
    WHEN success_package = 'premium' THEN 'quarterly'
    WHEN success_package = 'gold' THEN 'quarterly'
    WHEN success_package = 'elite' THEN 'annually'
    ELSE 'monthly'
  END,
  contract_start_date = CURRENT_DATE - INTERVAL '30 days',
  contract_end_date = CASE 
    WHEN success_package = 'light' THEN CURRENT_DATE + INTERVAL '1 month'
    WHEN success_package = 'premium' THEN CURRENT_DATE + INTERVAL '3 months'
    WHEN success_package = 'gold' THEN CURRENT_DATE + INTERVAL '3 months'
    WHEN success_package = 'elite' THEN CURRENT_DATE + INTERVAL '1 year'
    ELSE CURRENT_DATE + INTERVAL '3 months'
  END,
  monthly_fee = CASE 
    WHEN success_package = 'light' THEN 99.00
    WHEN success_package = 'premium' THEN 299.00
    WHEN success_package = 'gold' THEN 599.00
    WHEN success_package = 'elite' THEN 1299.00
    WHEN success_package = 'growth' THEN 299.00
    ELSE 299.00
  END,
  annual_fee = CASE 
    WHEN success_package = 'light' THEN 990.00
    WHEN success_package = 'premium' THEN 2990.00
    WHEN success_package = 'gold' THEN 5990.00
    WHEN success_package = 'elite' THEN 12990.00
    WHEN success_package = 'growth' THEN 2990.00
    ELSE 990.00
  END,
  setup_fee = CASE 
    WHEN success_package = 'light' THEN 199.00
    WHEN success_package = 'premium' THEN 499.00
    WHEN success_package = 'gold' THEN 999.00
    WHEN success_package = 'elite' THEN 1999.00
    WHEN success_package = 'growth' THEN 499.00
    ELSE 199.00
  END
WHERE plan_type IS NULL OR monthly_fee IS NULL;

-- Make the columns NOT NULL after setting defaults
ALTER TABLE clients 
ALTER COLUMN plan_type SET NOT NULL,
ALTER COLUMN billing_type SET NOT NULL;
