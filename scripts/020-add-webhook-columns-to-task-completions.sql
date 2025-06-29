-- Add webhook-friendly columns to task_completions table
ALTER TABLE task_completions 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS task_title VARCHAR(500);

-- Create index for webhook queries
CREATE INDEX IF NOT EXISTS idx_task_completions_webhook ON task_completions(client_name, task_title, is_completed);

-- Create index for email-based lookups
CREATE INDEX IF NOT EXISTS idx_task_completions_email ON task_completions(client_email, is_completed);

-- Add a webhook_sent column to track if webhook was already sent (optional, for reliability)
ALTER TABLE task_completions 
ADD COLUMN IF NOT EXISTS webhook_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for webhook processing
CREATE INDEX IF NOT EXISTS idx_task_completions_webhook_status ON task_completions(webhook_sent, is_completed);

-- Update existing records with client information (if any exist)
UPDATE task_completions 
SET 
    client_name = clients.name,
    client_email = clients.email
FROM clients 
WHERE task_completions.client_id = clients.id 
AND task_completions.client_name IS NULL;

-- Create a function to automatically populate webhook columns
CREATE OR REPLACE FUNCTION populate_task_completion_webhook_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Get client information if not already provided
    IF NEW.client_name IS NULL OR NEW.client_email IS NULL THEN
        SELECT name, email INTO NEW.client_name, NEW.client_email
        FROM clients 
        WHERE id = NEW.client_id;
    END IF;
    
    -- Reset webhook status when completion status changes
    IF OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
        NEW.webhook_sent = FALSE;
        NEW.webhook_sent_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate webhook data
DROP TRIGGER IF EXISTS task_completions_webhook_data_trigger ON task_completions;
CREATE TRIGGER task_completions_webhook_data_trigger
    BEFORE INSERT OR UPDATE ON task_completions
    FOR EACH ROW
    EXECUTE FUNCTION populate_task_completion_webhook_data();

-- Create a view for webhook consumption (makes it easier for Zapier)
CREATE OR REPLACE VIEW task_completion_webhooks AS
SELECT 
    id,
    client_id,
    client_name,
    client_email,
    task_id,
    task_title,
    is_completed,
    completed_at,
    webhook_sent,
    webhook_sent_at,
    created_at,
    updated_at
FROM task_completions
WHERE is_completed = TRUE 
AND (webhook_sent = FALSE OR webhook_sent IS NULL);

-- Grant access to the view (adjust permissions as needed)
-- GRANT SELECT ON task_completion_webhooks TO your_webhook_user;
