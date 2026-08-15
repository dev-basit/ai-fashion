-- Allow any authenticated user to read any profile.
-- Required so customers can see staff names on appointments (and vice-versa).
-- The two existing policies (select_own, select_staff_admin) are kept; this
-- adds a broader catch-all for authenticated sessions.
create policy "profiles_select_authenticated"
  on public.profiles
  for select
  using (auth.uid() is not null);
