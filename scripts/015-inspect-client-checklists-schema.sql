-- Script to inspect the actual schema of client_checklists table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'client_checklists' 
ORDER BY ordinal_position;
