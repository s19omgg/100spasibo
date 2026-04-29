-- 100spasibo MVP schema for Supabase.
-- This version is made for a fast MVP on GitHub Pages.
-- Important: admin policies below are permissive because the current admin gate is client-side.
-- Before storing real sensitive documents, replace admin policies with Supabase Auth + stricter RLS.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'published', 'rejected')),
  full_name text not null,
  birth_date text,
  city text not null,
  family_status text,
  dependents integer not null default 0,
  telegram text not null,
  contact_time text,
  category text not null,
  creditor text,
  contract_number text,
  contract_date text,
  debt_reason text,
  target_amount integer not null default 0,
  urgency text not null default 'В течение месяца',
  deadline text,
  story text not null,
  recipient_name text not null,
  bank text not null,
  card text not null,
  sbp_phone text,
  documents text[] not null default '{}',
  admin_note text
);

alter table public.applications enable row level security;

drop policy if exists "submit applications" on public.applications;
drop policy if exists "read published applications" on public.applications;
drop policy if exists "demo admin read applications" on public.applications;
drop policy if exists "demo admin update applications" on public.applications;

create policy "submit applications"
  on public.applications
  for insert
  to anon
  with check (status = 'new');

create policy "read published applications"
  on public.applications
  for select
  to anon
  using (status = 'published');

create policy "demo admin read applications"
  on public.applications
  for select
  to anon
  using (true);

create policy "demo admin update applications"
  on public.applications
  for update
  to anon
  using (true)
  with check (status in ('new', 'published', 'rejected'));

create index if not exists applications_status_created_idx
  on public.applications (status, created_at desc);
