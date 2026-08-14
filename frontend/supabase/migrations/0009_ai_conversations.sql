create table public.ai_conversations (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "ai_conversations_own"
  on public.ai_conversations for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index ai_conversations_user_updated
  on public.ai_conversations(user_id, updated_at desc);

-- ─────────────────────────────────────────────────────────────────────────────

create table public.ai_messages (
  id                 uuid primary key default uuid_generate_v4(),
  ai_conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role               text not null check (role in ('user', 'assistant')),
  content            text not null,
  created_at         timestamptz not null default now()
);

alter table public.ai_messages enable row level security;

-- SECURITY DEFINER helper avoids potential RLS recursion (same pattern as is_conversation_member in 0005)
create or replace function public.is_ai_conversation_owner(conv_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.ai_conversations
    where id = conv_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_ai_conversation_owner(uuid) to authenticated;

create policy "ai_messages_own"
  on public.ai_messages for all
  to authenticated
  using (public.is_ai_conversation_owner(ai_conversation_id))
  with check (public.is_ai_conversation_owner(ai_conversation_id));

create index ai_messages_conv_created
  on public.ai_messages(ai_conversation_id, created_at asc);

-- ─────────────────────────────────────────────────────────────────────────────

-- Trigger: keeps ai_conversations.updated_at current on every new message
create or replace function public.touch_ai_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_conversations
  set updated_at = now()
  where id = new.ai_conversation_id;
  return new;
end;
$$;

create trigger ai_messages_touch_conversation
  after insert on public.ai_messages
  for each row execute function public.touch_ai_conversation();
