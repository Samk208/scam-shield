-- Automatic trigger: the bank calls Scam Shield when a protected customer starts a transfer.
alter table public.checks drop constraint if exists checks_channel_check;
alter table public.checks add constraint checks_channel_check
  check (channel in ('sms','kakao','call_transcript','bank_transfer'));
alter table public.checks add column if not exists transfer jsonb;
