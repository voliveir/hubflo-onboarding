alter table clients
  add column if not exists implementation_manager text
  default 'vanessa'
  check (implementation_manager in ('vanessa','vishal')); 