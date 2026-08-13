-- Allow customers to submit consultation records for themselves.
-- The existing "consultation_records_all_staff_admin" policy only covers staff/admin,
-- leaving customers with no INSERT permission even when client_id = auth.uid().
create policy "consultation_records_insert_own_client" on public.consultation_records
  for insert with check (client_id = auth.uid());
