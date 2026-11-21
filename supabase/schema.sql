-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  category text not null,
  issue_date date not null,
  credential_id text,
  verification_url text,
  description text,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certificates_status_issue_date_idx
  on public.certificates (status, issue_date desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The Next.js API is the only client: it authenticates with the service_role
-- key, which bypasses RLS. The anon/authenticated roles get no access at all,
-- so a leaked public key cannot read drafts or write anything.
-- ---------------------------------------------------------------------------
alter table public.certificates enable row level security;

revoke all on public.certificates from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for certificate documents
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  26214400,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies for anon/authenticated: documents are only
-- reachable through short-lived signed URLs created server-side.
