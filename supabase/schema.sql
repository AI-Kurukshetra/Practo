create extension if not exists "pgcrypto";

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text not null,
  status text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references public.doctors (id) on delete set null,
  patient_name text not null,
  appointment_time timestamptz not null,
  status text not null,
  notes text,
  created_at timestamptz not null default now()
);
