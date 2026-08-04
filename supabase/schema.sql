-- ========================================================
-- Studio Paixão — Agenda Online — Schema do Supabase
-- Cole este arquivo inteiro em Supabase > SQL Editor > Run
-- ========================================================

create extension if not exists pgcrypto;

-- ---------- TABELAS ----------

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('cilios','sobrancelha')),
  name text not null,
  duration_minutes int not null,
  price_application numeric(10,2) not null,
  price_maintenance numeric(10,2),
  maintenance_note text,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists working_hours (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6), -- 0 = domingo
  start_time time not null,
  end_time time not null,
  active boolean not null default true
);

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  all_day boolean not null default true,
  start_time time,
  end_time time,
  note text
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  service_name text not null,
  booking_type text not null default 'aplicacao',
  price numeric(10,2) not null,
  client_name text not null,
  client_phone text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  payment_method text,
  status text not null default 'confirmado',
  created_at timestamptz not null default now()
);

-- caso a tabela já exista de uma versão anterior, garante a coluna nova:
alter table bookings add column if not exists payment_method text;

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------

alter table services enable row level security;
alter table working_hours enable row level security;
alter table blocked_dates enable row level security;
alter table bookings enable row level security;
alter table gallery_photos enable row level security;

drop policy if exists "public read active services" on services;
create policy "public read active services" on services
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists "admin all services" on services;
create policy "admin all services" on services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read working_hours" on working_hours;
create policy "public read working_hours" on working_hours for select using (true);

drop policy if exists "admin all working_hours" on working_hours;
create policy "admin all working_hours" on working_hours
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read blocked_dates" on blocked_dates;
create policy "public read blocked_dates" on blocked_dates for select using (true);

drop policy if exists "admin all blocked_dates" on blocked_dates;
create policy "admin all blocked_dates" on blocked_dates
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read gallery" on gallery_photos;
create policy "public read gallery" on gallery_photos for select using (true);

drop policy if exists "admin all gallery" on gallery_photos;
create policy "admin all gallery" on gallery_photos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- bookings: cliente NUNCA lê a tabela diretamente (privacidade). Toda leitura pública
-- de horários ocupados passa pela função get_booked_slots (abaixo), que só expõe
-- horário de início/fim, sem nome nem telefone. A criação de agendamento passa
-- pela função create_booking (abaixo), que também valida conflito de horário.

drop policy if exists "admin select bookings" on bookings;
create policy "admin select bookings" on bookings
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin update bookings" on bookings;
create policy "admin update bookings" on bookings
  for update using (auth.role() = 'authenticated');

drop policy if exists "admin delete bookings" on bookings;
create policy "admin delete bookings" on bookings
  for delete using (auth.role() = 'authenticated');

-- ---------- FUNÇÕES (RPC) ----------

create or replace function get_booked_slots(p_date date)
returns table(start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select start_time, end_time from bookings
  where date = p_date and status = 'confirmado';
$$;

grant execute on function get_booked_slots(date) to anon, authenticated;

drop function if exists create_booking(uuid, text, text, numeric, text, text, date, time, time);

create or replace function create_booking(
  p_service_id uuid,
  p_service_name text,
  p_booking_type text,
  p_price numeric,
  p_client_name text,
  p_client_phone text,
  p_date date,
  p_start_time time,
  p_end_time time,
  p_payment_method text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflict int;
  v_id uuid;
begin
  select count(*) into v_conflict from bookings
  where date = p_date and status = 'confirmado'
    and start_time < p_end_time and end_time > p_start_time;

  if v_conflict > 0 then
    raise exception 'HORARIO_INDISPONIVEL';
  end if;

  insert into bookings(
    service_id, service_name, booking_type, price,
    client_name, client_phone, date, start_time, end_time, payment_method
  )
  values (
    p_service_id, p_service_name, p_booking_type, p_price,
    p_client_name, p_client_phone, p_date, p_start_time, p_end_time, p_payment_method
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function create_booking(
  uuid, text, text, numeric, text, text, date, time, time, text
) to anon, authenticated;

-- ---------- DADOS INICIAIS ----------

insert into working_hours (weekday, start_time, end_time, active) values
  (0, '09:00', '18:00', false),
  (1, '09:00', '19:00', true),
  (2, '09:00', '19:00', true),
  (3, '09:00', '19:00', true),
  (4, '09:00', '19:00', true),
  (5, '09:00', '19:00', true),
  (6, '09:00', '17:00', true)
on conflict do nothing;

insert into services (category, name, duration_minutes, price_application, price_maintenance, maintenance_note, sort_order) values
  ('cilios', 'Volume Light', 90, 120, null, 'Não tem manutenção', 1),
  ('cilios', 'Volume Brasileiro', 90, 130, 110, null, 2),
  ('cilios', 'Volume Híbrido', 90, 145, 115, null, 3),
  ('cilios', 'Volume Russo', 120, 165, 130, null, 4),
  ('cilios', 'Fox Normal', 90, 160, null, null, 5),
  ('cilios', 'Mega Fox', 90, 185, null, null, 6),
  ('cilios', 'Efeito 4D', 90, 140, 120, null, 7),
  ('cilios', 'Remoção Química', 30, 40, null, null, 8),
  ('sobrancelha', 'Designer Simples', 30, 25, null, null, 9),
  ('sobrancelha', 'Designer com Henna', 30, 40, null, null, 10)
on conflict do nothing;
