-- Scam Shield schema.
-- Reads: RLS (family members only). Writes: API routes via service role, after server-side membership checks.
create extension if not exists pgcrypto;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('parent','guardian')),
  display_name text not null,
  lang text not null default 'ko' check (lang in ('ko','en')),
  primary key (family_id, user_id)
);

create table public.checks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  submitted_by uuid not null references auth.users(id),
  channel text not null check (channel in ('sms','kakao','call_transcript')),
  content text not null check (char_length(content) between 1 and 4000),
  status text not null default 'analyzing'
    check (status in ('analyzing','safe','held','blocked','released','failed')),
  risk_score int check (risk_score between 0 and 100),
  scam_type text check (scam_type in ('impersonation_authority','impersonation_family','loan_fraud','other_scam','legit')),
  red_flags jsonb not null default '[]'::jsonb,
  explanation_ko text,
  explanation_en text,
  safe_action_ko text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  check_id uuid not null references public.checks(id) on delete cascade,
  actor_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('user','ai','system')),
  event_type text not null check (event_type in
    ('submitted','ai_verdict','held','guardian_alerted','marked_safe','blocked','released','failed')),
  created_at timestamptz not null default now()
);

create index checks_family_created_idx on public.checks (family_id, created_at desc);
create index audit_check_created_idx on public.audit_events (check_id, created_at);
create index members_user_idx on public.family_members (user_id);

-- security definer avoids RLS recursion on family_members
create or replace function public.is_family_member(fid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.family_members where family_id = fid and user_id = auth.uid());
$$;
revoke all on function public.is_family_member(uuid) from public;
grant execute on function public.is_family_member(uuid) to authenticated;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.checks enable row level security;
alter table public.audit_events enable row level security;

create policy families_read on public.families for select to authenticated using (public.is_family_member(id));
create policy members_read on public.family_members for select to authenticated using (public.is_family_member(family_id));
create policy checks_read on public.checks for select to authenticated using (public.is_family_member(family_id));
create policy audit_read on public.audit_events for select to authenticated using (public.is_family_member(family_id));
-- No insert/update/delete policies: browsers cannot write directly.

alter publication supabase_realtime add table public.checks, public.audit_events;
