-- Migration: Create client_contacts table for storing multiple contacts per client

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  name varchar(255) not null,
  email varchar(255) not null,
  role varchar(100),
  phone varchar(50),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_client_contacts_client_id on public.client_contacts(client_id); 