-- First, update any existing invalid success_package values
UPDATE clients 
SET success_package = 'light' 
WHERE success_package NOT IN ('light', 'premium', 'gold', 'elite');

-- Drop the existing constraint if it exists
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_success_package_check;

-- Add the corrected constraint
ALTER TABLE clients ADD CONSTRAINT clients_success_package_check 
CHECK (success_package IN ('light', 'premium', 'gold', 'elite'));

-- Fix the plan_type constraint to include 'success' package
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_type_check;
ALTER TABLE clients ADD CONSTRAINT clients_plan_type_check 
  CHECK (plan_type IN ('starter', 'growth', 'elite', 'success'));
