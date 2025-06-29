-- First, let's check if the table exists and what columns it has
DO $$
BEGIN
    -- Drop the table if it exists to recreate with correct schema
    DROP TABLE IF EXISTS client_checklists;
    
    -- Create the client_checklists table with the correct schema
    CREATE TABLE client_checklists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create an index for better performance
    CREATE INDEX idx_client_checklists_client_id ON client_checklists(client_id);
    CREATE INDEX idx_client_checklists_completed ON client_checklists(client_id, is_completed);
    
    RAISE NOTICE 'client_checklists table created successfully';
END $$;
