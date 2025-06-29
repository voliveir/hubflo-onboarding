-- Add email column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to client_checklists table  
ALTER TABLE client_checklists ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Update existing client_checklists records with email from clients table
UPDATE client_checklists 
SET client_email = clients.email
FROM clients 
WHERE client_checklists.client_id = clients.id 
AND client_checklists.client_email IS NULL;

-- Add index for better performance on email searches
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_client_checklists_email ON client_checklists(client_email);
