-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.user_role as enum ('admin', 'staff', 'customer');
create type public.appointment_status as enum (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);
create type public.payment_status as enum (
  'unpaid', 'partial', 'paid', 'refunded'
);
create type public.order_status as enum (
  'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);
create type public.message_type as enum ('text', 'image', 'file', 'system');
create type public.plan_status as enum (
  'draft', 'active', 'completed', 'cancelled'
);
create type public.notification_type as enum (
  'appointment', 'message', 'order', 'system', 'reminder'
);

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           public.user_role not null default 'customer',
  full_name      text,
  phone          text,
  avatar_url     text,
  date_of_birth  date,
  notes          text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- =============================================================================
-- STAFF PROFILES
-- =============================================================================

create table public.staff_profiles (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null unique references public.profiles(id) on delete cascade,
  bio             text,
  specializations text[],
  certifications  text[],
  hire_date       date,
  hourly_rate     numeric(10,2),
  commission_rate numeric(5,2),
  is_available    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- SERVICE CATEGORIES (self-referential for subcategories)
-- =============================================================================

create table public.service_categories (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references public.service_categories(id) on delete set null,
  name        text not null,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- SERVICES
-- =============================================================================

create table public.services (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid references public.service_categories(id) on delete set null,
  name          text not null,
  description   text,
  base_price    numeric(10,2) not null,
  duration_mins integer not null,
  image_url     text,
  instructions  text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.service_variants (
  id                uuid primary key default uuid_generate_v4(),
  service_id        uuid not null references public.services(id) on delete cascade,
  name              text not null,
  price_modifier    numeric(10,2) not null default 0,
  duration_modifier integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create table public.service_tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  color      text,
  created_at timestamptz not null default now()
);

create table public.service_tag_relations (
  service_id uuid not null references public.services(id) on delete cascade,
  tag_id     uuid not null references public.service_tags(id) on delete cascade,
  primary key (service_id, tag_id)
);

create table public.staff_services (
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  service_id       uuid not null references public.services(id) on delete cascade,
  primary key (staff_profile_id, service_id)
);

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================

create table public.appointments (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references public.profiles(id),
  staff_profile_id      uuid references public.staff_profiles(id),
  service_id            uuid not null references public.services(id),
  service_variant_id    uuid references public.service_variants(id),
  starts_at             timestamptz not null,
  ends_at               timestamptz not null,
  status                public.appointment_status not null default 'pending',
  payment_status        public.payment_status not null default 'unpaid',
  price                 numeric(10,2) not null,
  discount              numeric(10,2) not null default 0,
  notes                 text,
  internal_notes        text,
  consultation_record_id uuid,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- =============================================================================
-- CONSULTATION FORMS
-- =============================================================================

create table public.consultation_form_templates (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  fields      jsonb not null default '[]',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.consultation_records (
  id               uuid primary key default uuid_generate_v4(),
  template_id      uuid references public.consultation_form_templates(id),
  client_id        uuid not null references public.profiles(id),
  staff_profile_id uuid references public.staff_profiles(id),
  appointment_id   uuid references public.appointments(id),
  responses        jsonb not null default '{}',
  observations     text,
  recommendations  text[],
  submitted_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.appointments
  add constraint appointments_consultation_record_id_fkey
  foreign key (consultation_record_id)
  references public.consultation_records(id)
  on delete set null;

-- =============================================================================
-- TREATMENT PLANS
-- =============================================================================

create table public.treatment_plan_templates (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  duration_days integer not null,
  steps        jsonb not null default '[]',
  created_by   uuid references public.profiles(id),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.client_treatment_plans (
  id             uuid primary key default uuid_generate_v4(),
  template_id    uuid references public.treatment_plan_templates(id),
  client_id      uuid not null references public.profiles(id),
  assigned_by    uuid references public.profiles(id),
  name           text not null,
  starts_on      date not null,
  ends_on        date,
  status         public.plan_status not null default 'draft',
  progress_notes jsonb not null default '[]',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- =============================================================================
-- PRODUCTS / ECOMMERCE
-- =============================================================================

create table public.product_categories (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references public.product_categories(id) on delete set null,
  name        text not null,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.products (
  id                  uuid primary key default uuid_generate_v4(),
  category_id         uuid references public.product_categories(id) on delete set null,
  name                text not null,
  description         text,
  sku                 text unique,
  price               numeric(10,2) not null,
  cost_price          numeric(10,2),
  stock_quantity      integer not null default 0,
  low_stock_threshold integer not null default 5,
  image_url           text,
  is_active           boolean not null default true,
  is_for_sale         boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references public.profiles(id),
  status           public.order_status not null default 'pending',
  total_amount     numeric(10,2) not null,
  shipping_address jsonb,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.order_items (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity   integer not null,
  unit_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table public.appointment_products (
  id             uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  product_id     uuid not null references public.products(id),
  quantity       numeric(10,3) not null,
  notes          text,
  created_at     timestamptz not null default now()
);

-- =============================================================================
-- CHAT / MESSAGING
-- =============================================================================

create table public.conversations (
  id         uuid primary key default uuid_generate_v4(),
  title      text,
  is_group   boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  content         text not null,
  message_type    public.message_type not null default 'text',
  metadata        jsonb,
  is_edited       boolean not null default false,
  edited_at       timestamptz,
  created_at      timestamptz not null default now()
);

create index messages_conversation_id_created_at_idx
  on public.messages(conversation_id, created_at desc);

-- =============================================================================
-- STAFF SCHEDULES
-- =============================================================================

create table public.staff_schedules (
  id               uuid primary key default uuid_generate_v4(),
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  day_of_week      smallint not null check (day_of_week between 0 and 6),
  start_time       time not null,
  end_time         time not null,
  is_working       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (staff_profile_id, day_of_week)
);

create table public.staff_leaves (
  id               uuid primary key default uuid_generate_v4(),
  staff_profile_id uuid not null references public.staff_profiles(id) on delete cascade,
  starts_at        date not null,
  ends_at          date not null,
  reason           text,
  approved_by      uuid references public.profiles(id),
  created_at       timestamptz not null default now()
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type       public.notification_type not null,
  title      text not null,
  body       text,
  data       jsonb,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_created_at_idx
  on public.notifications(profile_id, created_at desc);

-- =============================================================================
-- BUSINESS SETTINGS
-- =============================================================================

create table public.business_settings (
  id         uuid primary key default uuid_generate_v4(),
  key        text not null unique,
  value      jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (key, value) values
  ('business_profile', '{"name": "Glow By Miral", "address": "", "phone": "", "email": "", "website": "", "description": "", "logo_url": "", "timezone": "UTC", "currency": "USD"}'),
  ('working_hours', '{"monday": {"open": "09:00", "close": "18:00", "closed": false}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "friday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "10:00", "close": "16:00", "closed": false}, "sunday": {"open": "", "close": "", "closed": true}}'),
  ('appointment_settings', '{"buffer_minutes": 15, "max_advance_days": 60, "allow_online_booking": true, "cancellation_hours": 24}'),
  ('notification_settings', '{"appointment_reminders": true, "reminder_hours_before": 24, "sms_enabled": false, "email_enabled": true}');

-- =============================================================================
-- TRIGGERS: updated_at auto-update
-- =============================================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger staff_profiles_updated_at before update on public.staff_profiles
  for each row execute function public.handle_updated_at();
create trigger service_categories_updated_at before update on public.service_categories
  for each row execute function public.handle_updated_at();
create trigger services_updated_at before update on public.services
  for each row execute function public.handle_updated_at();
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.handle_updated_at();
create trigger consultation_form_templates_updated_at before update on public.consultation_form_templates
  for each row execute function public.handle_updated_at();
create trigger consultation_records_updated_at before update on public.consultation_records
  for each row execute function public.handle_updated_at();
create trigger treatment_plan_templates_updated_at before update on public.treatment_plan_templates
  for each row execute function public.handle_updated_at();
create trigger client_treatment_plans_updated_at before update on public.client_treatment_plans
  for each row execute function public.handle_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.handle_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();
create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.handle_updated_at();

-- =============================================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS HELPER FUNCTIONS
-- =============================================================================

create or replace function public.get_my_role()
returns public.user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff_or_admin()
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_variants enable row level security;
alter table public.service_tags enable row level security;
alter table public.service_tag_relations enable row level security;
alter table public.staff_services enable row level security;
alter table public.appointments enable row level security;
alter table public.consultation_form_templates enable row level security;
alter table public.consultation_records enable row level security;
alter table public.treatment_plan_templates enable row level security;
alter table public.client_treatment_plans enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.appointment_products enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.staff_schedules enable row level security;
alter table public.staff_leaves enable row level security;
alter table public.notifications enable row level security;
alter table public.business_settings enable row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_staff_admin" on public.profiles for select using (public.is_staff_or_admin());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());
create policy "profiles_insert_admin" on public.profiles for insert with check (public.is_admin());

-- STAFF PROFILES
create policy "staff_profiles_select_all" on public.staff_profiles for select using (true);
create policy "staff_profiles_all_admin" on public.staff_profiles for all using (public.is_admin());
create policy "staff_profiles_update_own" on public.staff_profiles for update using (profile_id = auth.uid());

-- SERVICES (public read, admin write)
create policy "services_select" on public.services for select using (is_active = true or public.is_staff_or_admin());
create policy "services_all_admin" on public.services for all using (public.is_admin());

create policy "service_categories_select" on public.service_categories for select using (true);
create policy "service_categories_all_admin" on public.service_categories for all using (public.is_admin());

create policy "service_variants_select" on public.service_variants for select using (true);
create policy "service_variants_all_admin" on public.service_variants for all using (public.is_admin());

create policy "service_tags_select" on public.service_tags for select using (true);
create policy "service_tags_all_admin" on public.service_tags for all using (public.is_admin());

create policy "service_tag_relations_select" on public.service_tag_relations for select using (true);
create policy "service_tag_relations_all_admin" on public.service_tag_relations for all using (public.is_admin());

create policy "staff_services_select" on public.staff_services for select using (true);
create policy "staff_services_all_admin" on public.staff_services for all using (public.is_admin());

-- APPOINTMENTS
create policy "appointments_select_own_client" on public.appointments
  for select using (client_id = auth.uid());
create policy "appointments_select_assigned_staff" on public.appointments
  for select using (
    exists(select 1 from public.staff_profiles sp
           where sp.id = appointments.staff_profile_id and sp.profile_id = auth.uid())
  );
create policy "appointments_select_admin" on public.appointments
  for select using (public.is_admin());
create policy "appointments_insert_client" on public.appointments
  for insert with check (client_id = auth.uid());
create policy "appointments_insert_staff_admin" on public.appointments
  for insert with check (public.is_staff_or_admin());
create policy "appointments_update_admin" on public.appointments
  for update using (public.is_admin());
create policy "appointments_update_assigned_staff" on public.appointments
  for update using (
    exists(select 1 from public.staff_profiles sp
           where sp.id = appointments.staff_profile_id and sp.profile_id = auth.uid())
  );
create policy "appointments_update_own_client_pending" on public.appointments
  for update using (client_id = auth.uid() and status = 'pending');

-- CONSULTATION
create policy "consultation_templates_select_active" on public.consultation_form_templates
  for select using (is_active = true or public.is_staff_or_admin());
create policy "consultation_templates_all_admin" on public.consultation_form_templates
  for all using (public.is_admin());

create policy "consultation_records_select_own_client" on public.consultation_records
  for select using (client_id = auth.uid());
create policy "consultation_records_select_staff_admin" on public.consultation_records
  for select using (public.is_staff_or_admin());
create policy "consultation_records_all_staff_admin" on public.consultation_records
  for all using (public.is_staff_or_admin());

-- TREATMENT PLANS
create policy "treatment_plan_templates_select_staff_admin" on public.treatment_plan_templates
  for select using (public.is_staff_or_admin());
create policy "treatment_plan_templates_all_admin" on public.treatment_plan_templates
  for all using (public.is_admin());

create policy "client_treatment_plans_select_own" on public.client_treatment_plans
  for select using (client_id = auth.uid());
create policy "client_treatment_plans_select_staff_admin" on public.client_treatment_plans
  for select using (public.is_staff_or_admin());
create policy "client_treatment_plans_all_staff_admin" on public.client_treatment_plans
  for all using (public.is_staff_or_admin());

-- PRODUCTS
create policy "products_select_public" on public.products
  for select using (is_active = true and is_for_sale = true);
create policy "products_select_staff_admin" on public.products
  for select using (public.is_staff_or_admin());
create policy "products_all_admin" on public.products for all using (public.is_admin());

create policy "product_categories_select" on public.product_categories for select using (true);
create policy "product_categories_all_admin" on public.product_categories for all using (public.is_admin());

-- ORDERS
create policy "orders_select_own" on public.orders for select using (client_id = auth.uid());
create policy "orders_select_staff_admin" on public.orders for select using (public.is_staff_or_admin());
create policy "orders_insert_own" on public.orders for insert with check (client_id = auth.uid());
create policy "orders_all_admin" on public.orders for all using (public.is_admin());

create policy "order_items_select_own" on public.order_items
  for select using (
    exists(select 1 from public.orders o where o.id = order_items.order_id and o.client_id = auth.uid())
  );
create policy "order_items_select_staff_admin" on public.order_items
  for select using (public.is_staff_or_admin());
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists(select 1 from public.orders o where o.id = order_items.order_id and o.client_id = auth.uid())
  );

create policy "appointment_products_select_staff_admin" on public.appointment_products
  for select using (public.is_staff_or_admin());
create policy "appointment_products_all_staff_admin" on public.appointment_products
  for all using (public.is_staff_or_admin());

-- CHAT
create policy "conversations_select_participants" on public.conversations
  for select using (
    exists(select 1 from public.conversation_participants cp
           where cp.conversation_id = conversations.id and cp.profile_id = auth.uid())
  );
create policy "conversations_insert_auth" on public.conversations
  for insert with check (auth.uid() is not null);

create policy "conversation_participants_select" on public.conversation_participants
  for select using (
    exists(select 1 from public.conversation_participants cp
           where cp.conversation_id = conversation_participants.conversation_id
             and cp.profile_id = auth.uid())
  );
create policy "conversation_participants_insert" on public.conversation_participants
  for insert with check (public.is_staff_or_admin() or profile_id = auth.uid());

create policy "messages_select_participants" on public.messages
  for select using (
    exists(select 1 from public.conversation_participants cp
           where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid())
  );
create policy "messages_insert_participants" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists(select 1 from public.conversation_participants cp
           where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid())
  );
create policy "messages_update_own" on public.messages for update using (sender_id = auth.uid());

-- STAFF SCHEDULES
create policy "staff_schedules_select_all" on public.staff_schedules for select using (true);
create policy "staff_schedules_all_admin" on public.staff_schedules for all using (public.is_admin());
create policy "staff_schedules_update_own" on public.staff_schedules
  for update using (
    exists(select 1 from public.staff_profiles sp
           where sp.id = staff_schedules.staff_profile_id and sp.profile_id = auth.uid())
  );

create policy "staff_leaves_select_staff_admin" on public.staff_leaves
  for select using (public.is_staff_or_admin());
create policy "staff_leaves_insert_own" on public.staff_leaves
  for insert with check (
    exists(select 1 from public.staff_profiles sp
           where sp.id = staff_leaves.staff_profile_id and sp.profile_id = auth.uid())
  );
create policy "staff_leaves_all_admin" on public.staff_leaves for all using (public.is_admin());

-- NOTIFICATIONS
create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid());
create policy "notifications_insert_all" on public.notifications
  for insert with check (true);
create policy "notifications_update_own" on public.notifications
  for update using (profile_id = auth.uid());

-- BUSINESS SETTINGS
create policy "business_settings_select_staff_admin" on public.business_settings
  for select using (public.is_staff_or_admin());
create policy "business_settings_all_admin" on public.business_settings
  for all using (public.is_admin());

-- =============================================================================
-- REALTIME
-- =============================================================================

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.conversations;
