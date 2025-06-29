-- Add client_name column to client_checklists table for easier webhook identification
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if client_name column already exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'client_checklists' 
        AND column_name = 'client_name'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- Add the client_name column
        ALTER TABLE client_checklists 
        ADD COLUMN client_name TEXT;
        
        RAISE NOTICE 'Added client_name column to client_checklists table';
        
        -- Update existing records with client names from the clients table
        UPDATE client_checklists 
        SET client_name = clients.name 
        FROM clients 
        WHERE client_checklists.client_id = clients.id;
        
        RAISE NOTICE 'Updated existing records with client names';
        
        -- Create an index on client_name for better query performance
        CREATE INDEX idx_client_checklists_client_name ON client_checklists(client_name);
        
        RAISE NOTICE 'Created index on client_name column';
    ELSE
        RAISE NOTICE 'client_name column already exists in client_checklists table';
    END IF;
    
    -- Show the updated table schema
    RAISE NOTICE 'Updated client_checklists table schema:';
    DECLARE
        column_info record;
    BEGIN
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
    END;
    
END $$;
