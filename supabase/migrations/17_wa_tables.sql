-- supabase/migrations/17_wa_tables.sql

-- Conversations: one row per WhatsApp contact
create table public.wa_conversations (
  id               uuid primary key default gen_random_uuid(),
  phone_number     text not null unique,
  patient_id       uuid references medical.profiles(id),
  state            text not null default 'new',
  mode             text not null default 'ai',
  assigned_to      text not null default 'ventas',
  escalation_reason text,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  constraint wa_conversations_state_check
    check (state in ('new','qualifying','nurturing','closing','post_sale','escalated','human')),
  constraint wa_conversations_mode_check
    check (mode in ('ai','human'))
);

-- Messages: log of every inbound and outbound message
create table public.wa_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.wa_conversations(id) on delete cascade,
  direction       text not null,
  content         text not null,
  agent_type      text,
  meta_message_id text,
  sent_at         timestamptz not null default now(),
  constraint wa_messages_direction_check
    check (direction in ('inbound','outbound'))
);

-- Campaigns: outbound campaigns proposed by the AI, approved by humans
create table public.wa_campaigns (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  segment_description         text,
  segment_query               jsonb,
  message_template            text not null,
  meta_template_id            text,
  status                      text not null default 'draft',
  proposed_at                 timestamptz not null default now(),
  approved_by_salesperson_at  timestamptz,
  approved_by_owner_at        timestamptz,
  cancelled_reason            text,
  sent_at                     timestamptz,
  recipient_count             int,
  constraint wa_campaigns_status_check
    check (status in ('draft','pending_salesperson','pending_owner','approved','sent','cancelled'))
);

-- Campaign recipients: one row per phone number per campaign
create table public.wa_campaign_recipients (
  id                       uuid primary key default gen_random_uuid(),
  campaign_id              uuid not null references public.wa_campaigns(id) on delete cascade,
  phone_number             text not null,
  patient_id               uuid references medical.profiles(id),
  status                   text not null default 'pending',
  sent_at                  timestamptz,
  response_conversation_id uuid references public.wa_conversations(id),
  constraint wa_campaign_recipients_status_check
    check (status in ('pending','sent','delivered','read','replied'))
);

-- RLS: all tables are backend-only (service key bypasses RLS)
alter table public.wa_conversations       enable row level security;
alter table public.wa_messages            enable row level security;
alter table public.wa_campaigns           enable row level security;
alter table public.wa_campaign_recipients enable row level security;

create policy "no_direct_access_wa_conversations"       on public.wa_conversations       for all using (false);
create policy "no_direct_access_wa_messages"            on public.wa_messages            for all using (false);
create policy "no_direct_access_wa_campaigns"           on public.wa_campaigns           for all using (false);
create policy "no_direct_access_wa_campaign_recipients" on public.wa_campaign_recipients for all using (false);

-- Performance indexes
create index wa_conversations_phone_idx        on public.wa_conversations(phone_number);
create index wa_conversations_last_msg_idx     on public.wa_conversations(last_message_at desc nulls last);
create index wa_messages_conversation_idx      on public.wa_messages(conversation_id);
create index wa_messages_sent_at_idx           on public.wa_messages(sent_at);

-- Realtime (required for supervisor dashboard live updates)
alter publication supabase_realtime add table public.wa_conversations;
alter publication supabase_realtime add table public.wa_messages;
