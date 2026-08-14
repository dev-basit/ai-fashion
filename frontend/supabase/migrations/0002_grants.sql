-- Explicit grants so PostgREST can use the service_role JWT to bypass RLS.
-- Without these, the service_role PostgreSQL role cannot access tables created
-- in migrations (Supabase local CLI does not auto-grant after migrations run).

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines  in schema public to service_role;

grant select                        on all tables    in schema public to anon;
grant all on all tables             in schema public to authenticated;
grant all on all sequences          in schema public to authenticated;

-- Default privileges for tables/sequences created in the future
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on tables    to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant select on tables to anon;
