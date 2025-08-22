-- RPC to update client approval fields without relying on PostgREST table schema cache
create or replace function public.update_client_approval(
  p_client_id uuid,
  p_status text default null,
  p_approval_at timestamptz default null,
  p_feedback text default null,
  p_feedback_at timestamptz default null,
  p_im_notified_at timestamptz default null
) returns void
language sql
security definer
as $$
  update public.clients
  set
    white_label_client_approval_status = coalesce(p_status, white_label_client_approval_status),
    white_label_client_approval_at = coalesce(p_approval_at, white_label_client_approval_at),
    white_label_approval_feedback = coalesce(p_feedback, white_label_approval_feedback),
    white_label_approval_feedback_at = coalesce(p_feedback_at, white_label_approval_feedback_at),
    white_label_implementation_manager_notified_at = coalesce(p_im_notified_at, white_label_implementation_manager_notified_at),
    updated_at = now()
  where id = p_client_id;
$$;

-- Permissions (optional when using service role, but safe to include for flexibility)
revoke all on function public.update_client_approval(uuid, text, timestamptz, text, timestamptz, timestamptz) from public;
grant execute on function public.update_client_approval(uuid, text, timestamptz, text, timestamptz, timestamptz) to anon, authenticated, service_role;
