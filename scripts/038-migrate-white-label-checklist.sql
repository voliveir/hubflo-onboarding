-- Migration script to update white label checklist structure
-- This converts existing boolean values to the new structure with completion timestamps

-- Update existing checklist data to new structure
UPDATE clients 
SET white_label_checklist = CASE 
  WHEN white_label_checklist IS NULL THEN '{}'::jsonb
  WHEN white_label_checklist = '{}'::jsonb THEN '{}'::jsonb
  ELSE (
    SELECT jsonb_object_agg(
      key,
      CASE 
        WHEN value::boolean = true THEN 
          jsonb_build_object('completed', true, 'completed_at', updated_at)
        ELSE 
          jsonb_build_object('completed', false)
      END
    )
    FROM jsonb_each(white_label_checklist)
  )
END
WHERE custom_app = 'white_label' 
  AND white_label_checklist IS NOT NULL 
  AND white_label_checklist != '{}'::jsonb;

-- Add a comment to document the migration
COMMENT ON COLUMN clients.white_label_checklist IS 'Updated structure: {step_key: {completed: boolean, completed_at?: string}}'; 