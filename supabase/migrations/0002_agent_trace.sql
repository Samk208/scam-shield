-- Agent trace: every step the Scam Shield agent took (perceive -> tools -> reason -> policy), shown in the UI and the warning record.
alter table public.checks add column if not exists agent_trace jsonb not null default '[]'::jsonb;
alter table public.checks add column if not exists indicators jsonb not null default '{}'::jsonb;
