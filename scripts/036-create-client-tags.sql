-- Migration: Create client_tags table for storing tags/segments per client

create table if not exists public.client_tags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  tag varchar(64) not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_client_tags_client_id on public.client_tags(client_id);
create index if not exists idx_client_tags_tag on public.client_tags(tag); 