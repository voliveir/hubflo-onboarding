-- Fix billing_type constraint issues
-- First, update any invalid billing_type values to 'Monthly'
UPDATE clients 
SET billing_type = 'monthly' 
WHERE billing_type NOT IN ('monthly', 'quarterly', 'annually') 
   OR billing_type IS NULL;

-- Now add the constraint if it doesn't exist
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_billing_type_check;

-- Add the correct constraint
ALTER TABLE clients ADD CONSTRAINT clients_billing_type_check 
    CHECK (billing_type IN ('monthly', 'quarterly', 'annually'));

-- Ensure billing_type is not null
ALTER TABLE clients 
ALTER COLUMN billing_type SET NOT NULL,
ALTER COLUMN billing_type SET DEFAULT 'monthly';
