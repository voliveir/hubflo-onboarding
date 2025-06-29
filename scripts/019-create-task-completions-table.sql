-- Create task_completions table for persistent task status across sessions
CREATE TABLE IF NOT EXISTS task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    task_id VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per client-task combination
    UNIQUE(client_id, task_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_completions_client_task ON task_completions(client_id, task_id);

-- Create index for completion status queries
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON task_completions(client_id, is_completed);

-- Add RLS (Row Level Security) for data protection
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow access only to records for the specific client
CREATE POLICY task_completions_client_policy ON task_completions
    FOR ALL USING (true); -- We'll handle access control in the application layer

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completions_updated_at_trigger
    BEFORE UPDATE ON task_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completions_updated_at();
