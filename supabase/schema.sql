-- ─────────────────────────────────────────────────────────────────────────────
-- UniCal AI — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 0. Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. Event status enum ───────────────────────────────────────────────────────
create type event_status as enum ('pending', 'completed', 'cancelled');

-- ── 2. users table ────────────────────────────────────────────────────────────
-- Extends auth.users with app-specific profile data.
create table if not exists public.users (
    id              uuid primary key references auth.users(id) on delete cascade,
    email           text not null,
    streak_days     integer not null default 0,
    unicorn_level   integer not null default 1,
    created_at      timestamptz not null default now()
);

-- Automatically create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ── 3. events table ───────────────────────────────────────────────────────────
-- Unified storage for both fixed schedules and AI-generated tasks.
-- All time columns use timestamptz so PostgreSQL stores UTC correctly.
create table if not exists public.events (
    id                uuid primary key default uuid_generate_v4(),
    user_id           uuid not null references public.users(id) on delete cascade,
    title             text not null,
    description       text,
    -- ISO 8601 UTC timestamps (e.g. "2026-04-21T08:00:00Z")
    start_time        timestamptz not null,
    end_time          timestamptz not null,
    -- IANA timezone of the user at time of creation (e.g. "Europe/Stockholm")
    timezone          text not null default 'UTC',
    -- false = fixed/imported schedule, true = AI-generated task
    is_ai_task        boolean not null default false,
    status            event_status not null default 'pending',
    -- Optional: Google Calendar event ID for two-way sync
    google_event_id   text,
    created_at        timestamptz not null default now(),

    constraint events_end_after_start check (end_time > start_time)
);

-- Index for fast per-user time-range queries (used by check_availability tool)
create index if not exists events_user_time_idx
    on public.events (user_id, start_time, end_time);

-- ── 4. trophies table ─────────────────────────────────────────────────────────
create table if not exists public.trophies (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid not null references public.users(id) on delete cascade,
    trophy_type     text not null,
    unlocked_at     timestamptz not null default now()
);

create index if not exists trophies_user_idx
    on public.trophies (user_id);

-- ── 5. Row Level Security (RLS) ───────────────────────────────────────────────
-- Users can only read/write their own data.

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.trophies enable row level security;

-- users
create policy "Users can view own profile"
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id);

-- events
create policy "Users can view own events"
    on public.events for select
    using (auth.uid() = user_id);

create policy "Users can insert own events"
    on public.events for insert
    with check (auth.uid() = user_id);

create policy "Users can update own events"
    on public.events for update
    using (auth.uid() = user_id);

create policy "Users can delete own events"
    on public.events for delete
    using (auth.uid() = user_id);

-- trophies
create policy "Users can view own trophies"
    on public.trophies for select
    using (auth.uid() = user_id);

create policy "Users can insert own trophies"
    on public.trophies for insert
    with check (auth.uid() = user_id);

-- ── 6. user_google_tokens table ───────────────────────────────────────────────
-- Stores the Google OAuth provider_token per user so it survives page reloads.
-- Supabase SSR does NOT persist provider_token in cookies across requests;
-- we capture it in the OAuth callback and store it here.
create table if not exists public.user_google_tokens (
    user_id         uuid primary key references public.users(id) on delete cascade,
    access_token    text not null,
    refresh_token   text,
    updated_at      timestamptz not null default now()
);

alter table public.user_google_tokens enable row level security;

create policy "Users can view own google tokens"
    on public.user_google_tokens for select
    using (auth.uid() = user_id);

create policy "Users can upsert own google tokens"
    on public.user_google_tokens for insert
    with check (auth.uid() = user_id);

create policy "Users can update own google tokens"
    on public.user_google_tokens for update
    using (auth.uid() = user_id);
