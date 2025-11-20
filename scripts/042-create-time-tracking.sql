-- Create time tracking system for client time management
-- This script creates tables to track meetings, emails, and general implementation work

-- Time Tracking Entries Table
CREATE TABLE IF NOT EXISTS client_time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('meeting', 'email', 'implementation')),
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_time_entries_client_id ON client_time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_client_time_entries_date ON client_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_client_time_entries_type ON client_time_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_client_time_entries_client_date ON client_time_entries(client_id, date DESC);

-- Create a view for time tracking summary by client
CREATE OR REPLACE VIEW client_time_summary AS
SELECT 
    client_id,
    entry_type,
    COUNT(*) as entry_count,
    SUM(duration_minutes) as total_minutes,
    SUM(duration_minutes) / 60.0 as total_hours,
    MIN(date) as first_entry_date,
    MAX(date) as last_entry_date
FROM client_time_entries
GROUP BY client_id, entry_type;

-- Create a function to get total time for a client
CREATE OR REPLACE FUNCTION get_client_total_time(client_uuid UUID)
RETURNS TABLE (
    total_minutes INTEGER,
    total_hours DECIMAL(10, 2),
    meeting_minutes INTEGER,
    email_minutes INTEGER,
    implementation_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(duration_minutes), 0)::INTEGER as total_minutes,
        COALESCE(SUM(duration_minutes) / 60.0, 0)::DECIMAL(10, 2) as total_hours,
        COALESCE(SUM(CASE WHEN entry_type = 'meeting' THEN duration_minutes ELSE 0 END), 0)::INTEGER as meeting_minutes,
        COALESCE(SUM(CASE WHEN entry_type = 'email' THEN duration_minutes ELSE 0 END), 0)::INTEGER as email_minutes,
        COALESCE(SUM(CASE WHEN entry_type = 'implementation' THEN duration_minutes ELSE 0 END), 0)::INTEGER as implementation_minutes
    FROM client_time_entries
    WHERE client_id = client_uuid;
END;
$$ LANGUAGE plpgsql;

