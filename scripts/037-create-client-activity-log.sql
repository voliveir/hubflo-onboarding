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