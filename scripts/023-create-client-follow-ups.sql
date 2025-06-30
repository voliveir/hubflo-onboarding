-- Create client_follow_ups table for client-specific follow-up reminders
CREATE TABLE IF NOT EXISTS client_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_follow_ups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_follow_ups_updated_at_trigger ON client_follow_ups;
CREATE TRIGGER client_follow_ups_updated_at_trigger
    BEFORE UPDATE ON client_follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_client_follow_ups_updated_at(); 