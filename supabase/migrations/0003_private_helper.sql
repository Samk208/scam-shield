-- Move the RLS helper out of the exposed API schema (Supabase advisor 0028/0029).
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_family_member(fid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.family_members where family_id = fid and user_id = auth.uid());
$$;
revoke all on function private.is_family_member(uuid) from public, anon;
grant execute on function private.is_family_member(uuid) to authenticated;

alter policy families_read on public.families using (private.is_family_member(id));
alter policy members_read on public.family_members using (private.is_family_member(family_id));
alter policy checks_read on public.checks using (private.is_family_member(family_id));
alter policy audit_read on public.audit_events using (private.is_family_member(family_id));

drop function public.is_family_member(uuid);
