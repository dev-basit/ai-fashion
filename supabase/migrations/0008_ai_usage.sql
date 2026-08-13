-- Tracks per-user daily AI call count for rate limiting
create table if not exists ai_usage (
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null default current_date,
  call_count integer not null default 0,
  primary key (user_id, date)
);

alter table ai_usage enable row level security;

-- Users can only read their own usage (for showing remaining calls in UI)
create policy "users read own ai usage"
  on ai_usage for select
  to authenticated
  using (user_id = auth.uid());
