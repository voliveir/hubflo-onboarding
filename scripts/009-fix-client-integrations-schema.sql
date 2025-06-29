-- Add integration_id column to reference master integrations
ALTER TABLE client_integrations 
ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL;

-- Make some fields optional when using master integrations
ALTER TABLE client_integrations 
ALTER COLUMN integration_type DROP NOT NULL,
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN url DROP NOT NULL;

-- Add constraint to ensure either integration_id is set OR custom fields are provided
ALTER TABLE client_integrations 
ADD CONSTRAINT client_integrations_data_check 
CHECK (
    (integration_id IS NOT NULL) OR 
    (integration_type IS NOT NULL AND title IS NOT NULL AND url IS NOT NULL)
);
