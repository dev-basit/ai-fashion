-- Fix: "infinite recursion detected in policy for relation conversation_participants" (42P17)
--
-- The original policies check membership with:
--   exists(select 1 from conversation_participants cp where cp.conversation_id = ... and cp.profile_id = auth.uid())
-- When that subquery runs against conversation_participants, it re-triggers the
-- conversation_participants SELECT policy → infinite recursion. This broke every
-- read of conversations, participants and messages (the chat list was always empty).
--
-- Solution: a SECURITY DEFINER helper that checks membership while bypassing RLS,
-- then rewrite the affected policies to call it.

create or replace function public.is_conversation_member(conv_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = conv_id
      and profile_id = auth.uid()
  );
$$;

grant execute on function public.is_conversation_member(uuid) to authenticated;

-- conversation_participants: you may read participant rows of any conversation you belong to
drop policy if exists "conversation_participants_select" on public.conversation_participants;
create policy "conversation_participants_select" on public.conversation_participants
  for select using (public.is_conversation_member(conversation_id));

-- conversations: you may read conversations you belong to
drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants" on public.conversations
  for select using (public.is_conversation_member(id));

-- messages: you may read/insert messages in conversations you belong to
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
  for select using (public.is_conversation_member(conversation_id));

drop policy if exists "messages_insert_participants" on public.messages;
create policy "messages_insert_participants" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );
