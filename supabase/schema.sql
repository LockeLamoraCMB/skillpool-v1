-- Skillpool V1 schema
-- Run this in the Supabase SQL Editor.
-- V1 keeps the schema simple and front-end friendly.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  program text,
  bio text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (program_id, slug)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete restrict,
  course_id uuid references public.courses (id) on delete set null,
  role_type text not null check (role_type in ('Tutor', 'Client')),
  title text not null,
  description text not null,
  price numeric(10, 2) not null default 0,
  meetup_option text not null check (meetup_option in ('Online', 'Face-to-face', 'Both')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.leaderboard_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles (id) on delete cascade,
  completed_requests integer not null default 0,
  average_rating numeric(3, 2) not null default 0,
  reply_count integer not null default 0,
  score integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_profiles_program on public.profiles (program);
create index if not exists idx_programs_slug on public.programs (slug);
create index if not exists idx_courses_program_id on public.courses (program_id);
create index if not exists idx_listings_user_id on public.listings (user_id);
create index if not exists idx_listings_program_id on public.listings (program_id);
create index if not exists idx_listings_course_id on public.listings (course_id);
create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_listings_created_at on public.listings (created_at desc);
create index if not exists idx_replies_listing_id on public.replies (listing_id);
create index if not exists idx_reviews_reviewee_id on public.reviews (reviewee_id);
create index if not exists idx_user_badges_user_id on public.user_badges (user_id);
create index if not exists idx_leaderboard_stats_score on public.leaderboard_stats (score desc);

-- Optional starter RLS switch-on for later.
-- Add policies only after your auth flow is wired up.
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.listings enable row level security;
alter table public.replies enable row level security;
alter table public.reviews enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.leaderboard_stats enable row level security;

-- Minimal read policies for public demo content.
create policy "public read programs" on public.programs
for select using (true);

create policy "public read courses" on public.courses
for select using (true);

create policy "public read badges" on public.badges
for select using (true);

create policy "public read listings" on public.listings
for select using (true);

create policy "public read leaderboard stats" on public.leaderboard_stats
for select using (true);

create policy "public read reviews" on public.reviews
for select using (true);

create policy "public read replies" on public.replies
for select using (true);

create policy "public read user badges" on public.user_badges
for select using (true);

create policy "students read profiles" on public.profiles
for select using (true);

-- Starter write policies:
create policy "users insert own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "users update own profile" on public.profiles
for update using (auth.uid() = id);

create policy "users insert own listings" on public.listings
for insert with check (auth.uid() = user_id);

create policy "users update own listings" on public.listings
for update using (auth.uid() = user_id);

create policy "users insert own replies" on public.replies
for insert with check (auth.uid() = user_id);

create policy "users insert own reviews" on public.reviews
for insert with check (auth.uid() = reviewer_id);
