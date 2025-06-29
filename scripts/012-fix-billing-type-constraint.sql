-- This is a duplicate of script 008, but keeping for consistency
-- Drop existing constraint if it exists
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_billing_type_check;

-- Add the correct constraint
ALTER TABLE clients ADD CONSTRAINT clients_billing_type_check 
    CHECK (billing_type IN ('monthly', 'quarterly', 'annually'));
