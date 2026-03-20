-- ============================================================
-- Shadow Ops Portal — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'guard' check (role in ('admin','manager','guard','client')),
  avatar_url  text,
  phone       text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins read all profiles"     on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'guard');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Clients
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email        text,
  phone        text,
  created_at   timestamptz default now()
);
alter table public.clients enable row level security;
create policy "Managers can read clients" on public.clients for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- 3. Sites
create table if not exists public.sites (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  location   text,
  status     text default 'active' check (status in ('active','inactive','alert','warning')),
  client_id  uuid references public.clients(id),
  created_at timestamptz default now()
);
alter table public.sites enable row level security;
create policy "Authenticated users read sites" on public.sites for select using (auth.role() = 'authenticated');
create policy "Managers manage sites"           on public.sites for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- 4. Guards (extends profiles for guards)
create table if not exists public.guards (
  id           uuid primary key references public.profiles(id) on delete cascade,
  badge_number text unique,
  status       text default 'off_duty' check (status in ('on_duty','off_duty','on_leave','patrol')),
  site_id      uuid references public.sites(id),
  shift_start  timestamptz,
  shift_end    timestamptz,
  created_at   timestamptz default now()
);
alter table public.guards enable row level security;
create policy "Managers read guards" on public.guards for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);
create policy "Guards read own record" on public.guards for select using (auth.uid() = id);

-- 5. Incidents
create table if not exists public.incidents (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  type        text not null check (type in ('unauthorized_access','suspicious_activity','property_damage','medical','camera_offline','other')),
  description text,
  site_id     uuid references public.sites(id),
  guard_id    uuid references public.profiles(id),
  priority    text default 'medium' check (priority in ('high','medium','low')),
  status      text default 'open'   check (status in ('open','resolved','critical')),
  created_at  timestamptz default now(),
  resolved_at timestamptz
);
alter table public.incidents enable row level security;
create policy "Authenticated users read incidents" on public.incidents for select using (auth.role() = 'authenticated');
create policy "Guards create incidents"            on public.incidents for insert with check (auth.role() = 'authenticated');
create policy "Managers update incidents"          on public.incidents for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- 6. Activity Log
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('checkin','checkout','patrol','incident','alert','report')),
  message    text not null,
  guard_id   uuid references public.profiles(id),
  site_id    uuid references public.sites(id),
  created_at timestamptz default now()
);
alter table public.activity_log enable row level security;
create policy "Authenticated users read activity" on public.activity_log for select using (auth.role() = 'authenticated');
create policy "Authenticated users insert activity" on public.activity_log for insert with check (auth.role() = 'authenticated');

-- Enable realtime for activity feed
alter publication supabase_realtime add table public.activity_log;
alter publication supabase_realtime add table public.incidents;
