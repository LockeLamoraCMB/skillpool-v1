-- Skillpool launch-ready integrations: STI profiles, forum exchanges, ratings, PayMongo, and leaderboard scoring.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists role text,
  add column if not exists about text,
  add column if not exists banner_url text,
  add column if not exists badges text[] not null default '{}',
  add column if not exists tags text[] not null default '{}',
  add column if not exists connections jsonb not null default '[]'::jsonb,
  add column if not exists joined_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.programs
  add column if not exists sort_order integer not null default 0;

alter table public.courses
  add column if not exists code text,
  add column if not exists sort_order integer not null default 0;

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete restrict,
  course_id uuid references public.courses (id) on delete set null,
  post_type text not null default 'offer' check (post_type in ('offer', 'need_help')),
  title text not null,
  slug text unique not null,
  body_html text not null,
  tags text[] not null default '{}',
  price_amount numeric(10, 2) not null default 0 check (price_amount >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_posts
  add column if not exists price_amount numeric(10, 2) not null default 0 check (price_amount >= 0),
  add column if not exists is_featured boolean not null default false;

create table if not exists public.forum_post_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  bucket text not null,
  storage_path text not null,
  public_url text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  is_image boolean not null default false,
  is_inline boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_exchanges (
  id uuid primary key default gen_random_uuid(),
  forum_post_id uuid references public.forum_posts (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'completed', 'canceled')),
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skill_exchanges_distinct_participants check (requester_id <> provider_id)
);

alter table public.skill_exchanges
  add column if not exists forum_post_id uuid references public.forum_posts (id) on delete cascade,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'skill_exchanges'
      and column_name = 'post_id'
  ) then
    execute 'update public.skill_exchanges set forum_post_id = coalesce(forum_post_id, post_id) where forum_post_id is null';
  end if;
end $$;

create table if not exists public.exchange_reviews (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.skill_exchanges (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exchange_reviews_not_self check (reviewer_id <> reviewed_user_id),
  unique (exchange_id, reviewer_id, reviewed_user_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid not null references public.profiles (id) on delete cascade,
  payee_id uuid references public.profiles (id) on delete set null,
  exchange_id uuid references public.skill_exchanges (id) on delete set null,
  forum_post_id uuid references public.forum_posts (id) on delete set null,
  listing_id uuid references public.listings (id) on delete set null,
  amount numeric(10, 2) not null check (amount > 0),
  amount_centavos integer not null check (amount_centavos > 0),
  currency text not null default 'PHP',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled', 'expired', 'refunded')),
  checkout_url text,
  paymongo_checkout_session_id text unique,
  paymongo_payment_id text,
  paymongo_payment_intent_id text,
  failure_reason text,
  provider_response jsonb,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_type text not null,
  payment_id uuid references public.payments (id) on delete set null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
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

alter table public.leaderboard_stats
  add column if not exists review_count integer not null default 0,
  add column if not exists forum_posts integer not null default 0,
  add column if not exists badge_count integer not null default 0,
  add column if not exists paid_payments integer not null default 0,
  add column if not exists received_payments integer not null default 0,
  add column if not exists payment_volume numeric(10, 2) not null default 0;

create index if not exists idx_forum_posts_author_id on public.forum_posts (author_id);
create index if not exists idx_forum_posts_slug on public.forum_posts (slug);
create index if not exists idx_forum_posts_program_course on public.forum_posts (program_id, course_id);
create index if not exists idx_forum_posts_updated_at on public.forum_posts (updated_at desc);
create index if not exists idx_forum_post_attachments_post_id on public.forum_post_attachments (post_id);
create index if not exists idx_skill_exchanges_forum_post_id on public.skill_exchanges (forum_post_id);
create index if not exists idx_skill_exchanges_requester_id on public.skill_exchanges (requester_id);
create index if not exists idx_skill_exchanges_provider_id on public.skill_exchanges (provider_id);
create index if not exists idx_exchange_reviews_reviewed_user_id on public.exchange_reviews (reviewed_user_id);
create index if not exists idx_exchange_reviews_reviewer_id on public.exchange_reviews (reviewer_id);
create index if not exists idx_payments_exchange_id on public.payments (exchange_id);
create index if not exists idx_payments_payer_id on public.payments (payer_id);
create index if not exists idx_payments_payee_id on public.payments (payee_id);
create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_payment_events_event_id on public.payment_events (event_id);

create or replace function public.is_username_available(desired_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(trim(desired_username))
  );
$$;

create or replace function public.generate_unique_username(
  desired_username text,
  fallback_seed text,
  current_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := regexp_replace(lower(coalesce(nullif(trim(desired_username), ''), fallback_seed, 'student')), '[^a-z0-9_]+', '_', 'g');
  base_username := trim(both '_' from regexp_replace(base_username, '_+', '_', 'g'));
  base_username := left(coalesce(nullif(base_username, ''), 'student'), 20);
  candidate := base_username;

  while exists (
    select 1
    from public.profiles
    where username = candidate
      and id <> current_user_id
  ) loop
    suffix := suffix + 1;
    candidate := left(base_username, greatest(1, 20 - length(suffix::text) - 1)) || '_' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_forum_posts_updated_at on public.forum_posts;
create trigger set_forum_posts_updated_at
before update on public.forum_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_skill_exchanges_updated_at on public.skill_exchanges;
create trigger set_skill_exchanges_updated_at
before update on public.skill_exchanges
for each row execute function public.set_updated_at();

drop trigger if exists set_exchange_reviews_updated_at on public.exchange_reviews;
create trigger set_exchange_reviews_updated_at
before update on public.exchange_reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create or replace view public.forum_post_feed
with (security_invoker = true) as
with author_reviews as (
  select
    reviewed_user_id,
    avg(rating)::numeric(3, 2) as average_rating,
    count(*)::integer as review_count
  from public.exchange_reviews
  group by reviewed_user_id
)
select
  fp.id,
  fp.author_id,
  fp.program_id,
  fp.course_id,
  fp.post_type,
  fp.title,
  fp.slug,
  fp.body_html,
  fp.tags,
  fp.price_amount,
  fp.is_featured,
  fp.created_at,
  fp.updated_at,
  p.username as author_username,
  p.full_name as author_full_name,
  p.avatar_url as author_avatar_url,
  coalesce(p.role, p.program, 'Student') as author_role,
  p.program as author_program,
  programs.name as program_name,
  programs.slug as program_slug,
  courses.name as course_name,
  courses.slug as course_slug,
  coalesce(author_reviews.average_rating, 0)::numeric(3, 2) as author_average_rating,
  coalesce(author_reviews.review_count, 0)::integer as author_review_count
from public.forum_posts fp
join public.profiles p on p.id = fp.author_id
left join public.programs on programs.id = fp.program_id
left join public.courses on courses.id = fp.course_id
left join author_reviews on author_reviews.reviewed_user_id = fp.author_id;

create or replace function public.refresh_leaderboard_stats()
returns void
language sql
security definer
set search_path = public
as $$
  with review_stats as (
    select
      reviewed_user_id as user_id,
      count(*)::integer as review_count,
      coalesce(avg(rating), 0)::numeric(3, 2) as average_rating
    from public.exchange_reviews
    group by reviewed_user_id
  ),
  completed_users as (
    select provider_id as user_id, count(*)::integer as completed_requests
    from public.skill_exchanges
    where status = 'completed'
    group by provider_id
    union all
    select requester_id as user_id, count(*)::integer as completed_requests
    from public.skill_exchanges
    where status = 'completed'
    group by requester_id
  ),
  completed_stats as (
    select user_id, sum(completed_requests)::integer as completed_requests
    from completed_users
    group by user_id
  ),
  reply_stats as (
    select user_id, count(*)::integer as reply_count
    from public.replies
    group by user_id
  ),
  post_stats as (
    select author_id as user_id, count(*)::integer as forum_posts
    from public.forum_posts
    group by author_id
  ),
  badge_stats as (
    select user_id, count(*)::integer as badge_count
    from public.user_badges
    group by user_id
  ),
  paid_stats as (
    select payer_id as user_id, count(*)::integer as paid_payments
    from public.payments
    where status = 'paid'
    group by payer_id
  ),
  received_stats as (
    select
      payee_id as user_id,
      count(*)::integer as received_payments,
      coalesce(sum(amount), 0)::numeric(10, 2) as payment_volume
    from public.payments
    where status = 'paid' and payee_id is not null
    group by payee_id
  ),
  scored as (
    select
      p.id as user_id,
      coalesce(cs.completed_requests, 0) as completed_requests,
      coalesce(rs.average_rating, 0) as average_rating,
      coalesce(rs.review_count, 0) as review_count,
      coalesce(rp.reply_count, 0) as reply_count,
      coalesce(ps.forum_posts, 0) as forum_posts,
      coalesce(bs.badge_count, 0) as badge_count,
      coalesce(pp.paid_payments, 0) as paid_payments,
      coalesce(rcv.received_payments, 0) as received_payments,
      coalesce(rcv.payment_volume, 0) as payment_volume
    from public.profiles p
    left join review_stats rs on rs.user_id = p.id
    left join completed_stats cs on cs.user_id = p.id
    left join reply_stats rp on rp.user_id = p.id
    left join post_stats ps on ps.user_id = p.id
    left join badge_stats bs on bs.user_id = p.id
    left join paid_stats pp on pp.user_id = p.id
    left join received_stats rcv on rcv.user_id = p.id
  )
  insert into public.leaderboard_stats (
    user_id,
    completed_requests,
    average_rating,
    review_count,
    reply_count,
    forum_posts,
    badge_count,
    paid_payments,
    received_payments,
    payment_volume,
    score,
    updated_at
  )
  select
    user_id,
    completed_requests,
    average_rating,
    review_count,
    reply_count,
    forum_posts,
    badge_count,
    paid_payments,
    received_payments,
    payment_volume,
    (
      round(average_rating * 120)
      + review_count * 35
      + completed_requests * 90
      + forum_posts * 18
      + reply_count * 10
      + badge_count * 55
      + received_payments * 70
      + paid_payments * 25
      + least(round(payment_volume / 100), 120)
    )::integer as score,
    now()
  from scored
  on conflict (user_id) do update set
    completed_requests = excluded.completed_requests,
    average_rating = excluded.average_rating,
    review_count = excluded.review_count,
    reply_count = excluded.reply_count,
    forum_posts = excluded.forum_posts,
    badge_count = excluded.badge_count,
    paid_payments = excluded.paid_payments,
    received_payments = excluded.received_payments,
    payment_volume = excluded.payment_volume,
    score = excluded.score,
    updated_at = now();
$$;

create or replace function public.get_leaderboard_rankings(leaderboard_period text default 'overall')
returns table (
  user_id uuid,
  completed_requests integer,
  average_rating numeric,
  review_count integer,
  reply_count integer,
  forum_posts integer,
  badge_count integer,
  paid_payments integer,
  received_payments integer,
  payment_volume numeric,
  score integer
)
language sql
stable
security definer
set search_path = public
as $$
  with cutoff as (
    select case
      when leaderboard_period = 'weekly' then now() - interval '7 days'
      when leaderboard_period = 'monthly' then now() - interval '1 month'
      else null::timestamptz
    end as since
  ),
  review_stats as (
    select
      er.reviewed_user_id as user_id,
      count(*)::integer as review_count,
      coalesce(avg(er.rating), 0)::numeric(3, 2) as average_rating
    from public.exchange_reviews er
    cross join cutoff
    where cutoff.since is null or er.created_at >= cutoff.since
    group by er.reviewed_user_id
  ),
  completed_users as (
    select se.provider_id as user_id, count(*)::integer as completed_requests
    from public.skill_exchanges se
    cross join cutoff
    where se.status = 'completed'
      and (cutoff.since is null or coalesce(se.completed_at, se.created_at) >= cutoff.since)
    group by se.provider_id
    union all
    select se.requester_id as user_id, count(*)::integer as completed_requests
    from public.skill_exchanges se
    cross join cutoff
    where se.status = 'completed'
      and (cutoff.since is null or coalesce(se.completed_at, se.created_at) >= cutoff.since)
    group by se.requester_id
  ),
  completed_stats as (
    select completed_users.user_id, sum(completed_users.completed_requests)::integer as completed_requests
    from completed_users
    group by completed_users.user_id
  ),
  reply_stats as (
    select r.user_id, count(*)::integer as reply_count
    from public.replies r
    cross join cutoff
    where cutoff.since is null or r.created_at >= cutoff.since
    group by r.user_id
  ),
  post_stats as (
    select fp.author_id as user_id, count(*)::integer as forum_posts
    from public.forum_posts fp
    cross join cutoff
    where cutoff.since is null or fp.created_at >= cutoff.since
    group by fp.author_id
  ),
  badge_stats as (
    select ub.user_id, count(*)::integer as badge_count
    from public.user_badges ub
    cross join cutoff
    where cutoff.since is null or ub.awarded_at >= cutoff.since
    group by ub.user_id
  ),
  paid_stats as (
    select pay.payer_id as user_id, count(*)::integer as paid_payments
    from public.payments pay
    cross join cutoff
    where pay.status = 'paid'
      and (cutoff.since is null or coalesce(pay.paid_at, pay.created_at) >= cutoff.since)
    group by pay.payer_id
  ),
  received_stats as (
    select
      pay.payee_id as user_id,
      count(*)::integer as received_payments,
      coalesce(sum(pay.amount), 0)::numeric(10, 2) as payment_volume
    from public.payments pay
    cross join cutoff
    where pay.status = 'paid'
      and pay.payee_id is not null
      and (cutoff.since is null or coalesce(pay.paid_at, pay.created_at) >= cutoff.since)
    group by pay.payee_id
  ),
  scored as (
    select
      p.id as user_id,
      coalesce(cs.completed_requests, 0) as completed_requests,
      coalesce(rs.average_rating, 0) as average_rating,
      coalesce(rs.review_count, 0) as review_count,
      coalesce(rp.reply_count, 0) as reply_count,
      coalesce(ps.forum_posts, 0) as forum_posts,
      coalesce(bs.badge_count, 0) as badge_count,
      coalesce(pp.paid_payments, 0) as paid_payments,
      coalesce(rcv.received_payments, 0) as received_payments,
      coalesce(rcv.payment_volume, 0) as payment_volume
    from public.profiles p
    left join review_stats rs on rs.user_id = p.id
    left join completed_stats cs on cs.user_id = p.id
    left join reply_stats rp on rp.user_id = p.id
    left join post_stats ps on ps.user_id = p.id
    left join badge_stats bs on bs.user_id = p.id
    left join paid_stats pp on pp.user_id = p.id
    left join received_stats rcv on rcv.user_id = p.id
  )
  select
    scored.user_id,
    scored.completed_requests,
    scored.average_rating,
    scored.review_count,
    scored.reply_count,
    scored.forum_posts,
    scored.badge_count,
    scored.paid_payments,
    scored.received_payments,
    scored.payment_volume,
    (
      round(scored.average_rating * 120)
      + scored.review_count * 35
      + scored.completed_requests * 90
      + scored.forum_posts * 18
      + scored.reply_count * 10
      + scored.badge_count * 55
      + scored.received_payments * 70
      + scored.paid_payments * 25
      + least(round(scored.payment_volume / 100), 120)
    )::integer as score
  from scored;
$$;

create or replace function public.refresh_leaderboard_stats_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_leaderboard_stats();
  return null;
end;
$$;

drop trigger if exists refresh_leaderboard_on_exchange on public.skill_exchanges;
create trigger refresh_leaderboard_on_exchange
after insert or update or delete on public.skill_exchanges
for each statement execute function public.refresh_leaderboard_stats_trigger();

drop trigger if exists refresh_leaderboard_on_review on public.exchange_reviews;
create trigger refresh_leaderboard_on_review
after insert or update or delete on public.exchange_reviews
for each statement execute function public.refresh_leaderboard_stats_trigger();

drop trigger if exists refresh_leaderboard_on_payment on public.payments;
create trigger refresh_leaderboard_on_payment
after insert or update or delete on public.payments
for each statement execute function public.refresh_leaderboard_stats_trigger();

alter table public.forum_posts enable row level security;
alter table public.forum_post_attachments enable row level security;
alter table public.skill_exchanges enable row level security;
alter table public.exchange_reviews enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "students read profiles" on public.profiles;
create policy "students read profiles" on public.profiles
for select using (auth.uid() is not null);

drop policy if exists "students read forum posts" on public.forum_posts;
create policy "students read forum posts" on public.forum_posts
for select using (auth.uid() is not null);

drop policy if exists "students create own forum posts" on public.forum_posts;
create policy "students create own forum posts" on public.forum_posts
for insert with check (auth.uid() = author_id);

drop policy if exists "students update own forum posts" on public.forum_posts;
create policy "students update own forum posts" on public.forum_posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "students read forum attachments" on public.forum_post_attachments;
create policy "students read forum attachments" on public.forum_post_attachments
for select using (auth.uid() is not null);

drop policy if exists "students manage own forum attachments" on public.forum_post_attachments;
create policy "students manage own forum attachments" on public.forum_post_attachments
for all using (auth.uid() = uploader_id) with check (auth.uid() = uploader_id);

drop policy if exists "students read exchanges they participate in" on public.skill_exchanges;
create policy "students read exchanges they participate in" on public.skill_exchanges
for select using (auth.uid() = requester_id or auth.uid() = provider_id);

drop policy if exists "students create own exchanges" on public.skill_exchanges;
create policy "students create own exchanges" on public.skill_exchanges
for insert with check (auth.uid() = requester_id or auth.uid() = provider_id);

drop policy if exists "students update own exchanges" on public.skill_exchanges;
create policy "students update own exchanges" on public.skill_exchanges
for update using (auth.uid() = requester_id or auth.uid() = provider_id)
with check (auth.uid() = requester_id or auth.uid() = provider_id);

drop policy if exists "students read exchange reviews" on public.exchange_reviews;
create policy "students read exchange reviews" on public.exchange_reviews
for select using (auth.uid() is not null);

drop policy if exists "students insert own exchange reviews" on public.exchange_reviews;
create policy "students insert own exchange reviews" on public.exchange_reviews
for insert with check (auth.uid() = reviewer_id);

drop policy if exists "students update own exchange reviews" on public.exchange_reviews;
create policy "students update own exchange reviews" on public.exchange_reviews
for update using (auth.uid() = reviewer_id) with check (auth.uid() = reviewer_id);

drop policy if exists "students read own payments" on public.payments;
create policy "students read own payments" on public.payments
for select using (auth.uid() = payer_id or auth.uid() = payee_id);

drop policy if exists "students create own pending payments" on public.payments;
create policy "students create own pending payments" on public.payments
for insert with check (auth.uid() = payer_id and status = 'pending');

drop policy if exists "students cancel own pending payments" on public.payments;
create policy "students cancel own pending payments" on public.payments
for update using (auth.uid() = payer_id and status = 'pending')
with check (auth.uid() = payer_id);

drop policy if exists "students read leaderboard stats" on public.leaderboard_stats;
drop policy if exists "public read leaderboard stats" on public.leaderboard_stats;
create policy "students read leaderboard stats" on public.leaderboard_stats
for select using (auth.uid() is not null);

select public.refresh_leaderboard_stats();
