-- Migration: Create client_activity_log table for tracking all client events

create table if not exists public.client_activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  event_type varchar(64) not null, -- e.g., 'tag_added', 'contact_added', 'note_updated', 'manual'
  event_data jsonb,
  created_by text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_client_activity_log_client_id on public.client_activity_log(client_id); 

-- Migration: Add follow_up_email_sent column to clients table for persistent follow-up tracking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS follow_up_email_sent BOOLEAN DEFAULT false; 

-- Migration: Create client_follow_up_emails table for tracking follow-up email reminders per client and interval
CREATE TABLE IF NOT EXISTS client_follow_up_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    reminder_number INTEGER NOT NULL, -- 1 for week 1, 2 for week 3, etc.
    reminder_date DATE NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, reminder_number)
);

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_client_follow_up_emails_client_id ON client_follow_up_emails(client_id); 

-- Add white label app details fields
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS white_label_app_name TEXT,
  ADD COLUMN IF NOT EXISTS white_label_app_description TEXT,
  ADD COLUMN IF NOT EXISTS white_label_app_assets JSONB; 