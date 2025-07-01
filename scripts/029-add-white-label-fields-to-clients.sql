-- Migration: Add white label app tracking fields to clients table
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS white_label_status VARCHAR(32) NOT NULL DEFAULT 'not_started',
    ADD COLUMN IF NOT EXISTS white_label_checklist JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS white_label_android_url TEXT,
    ADD COLUMN IF NOT EXISTS white_label_ios_url TEXT; 