-- First, let's see what columns actually exist in the client_checklists table
DO $$
DECLARE
    table_exists boolean;
    column_info record;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'client_checklists'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'client_checklists table exists. Current columns:';
        
        -- Show current columns
        FOR column_info IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'client_checklists' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
                column_info.column_name, 
                column_info.data_type, 
                column_info.is_nullable, 
                column_info.column_default;
        END LOOP;
        
        -- Drop and recreate the table with correct schema
        RAISE NOTICE 'Dropping existing table and recreating with correct schema...';
        DROP TABLE client_checklists CASCADE;
    ELSE
        RAISE NOTICE 'client_checklists table does not exist. Creating new table...';
    END IF;
    
    -- Create the table with the correct schema
    CREATE TABLE client_checklists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX idx_client_checklists_client_id ON client_checklists(client_id);
    CREATE INDEX idx_client_checklists_completed ON client_checklists(client_id, is_completed);
    
    -- Enable RLS (if needed)
    ALTER TABLE client_checklists ENABLE ROW LEVEL SECURITY;
    
    -- Create a permissive policy for now (adjust based on your auth requirements)
    CREATE POLICY "Allow all operations on client_checklists" ON client_checklists
        FOR ALL USING (true);
    
    RAISE NOTICE 'client_checklists table created successfully with correct schema';
    
    -- Show the new schema
    RAISE NOTICE 'New table schema:';
    FOR column_info IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'client_checklists' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            column_info.column_name, 
            column_info.data_type, 
            column_info.is_nullable, 
            column_info.column_default;
    END LOOP;
    
END $$;
