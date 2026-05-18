-- Skillpool forum comments, direct messages, and notifications.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  forum_post_id uuid not null constraint forum_comments_forum_post_id_fkey references public.forum_posts (id) on delete cascade,
  user_id uuid not null constraint forum_comments_user_id_fkey references public.profiles (id) on delete cascade,
  parent_comment_id uuid constraint forum_comments_parent_comment_id_fkey references public.forum_comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_comments_content_not_blank check (length(btrim(content)) > 0)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null constraint messages_sender_id_fkey references public.profiles (id) on delete cascade,
  receiver_id uuid not null constraint messages_receiver_id_fkey references public.profiles (id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_content_not_blank check (length(btrim(content)) > 0),
  constraint messages_distinct_participants check (sender_id <> receiver_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null constraint notifications_user_id_fkey references public.profiles (id) on delete cascade,
  actor_id uuid constraint notifications_actor_id_fkey references public.profiles (id) on delete set null,
  type text not null check (type in ('direct_message', 'forum_comment', 'comment_reply')),
  related_post_id uuid constraint notifications_related_post_id_fkey references public.forum_posts (id) on delete cascade,
  related_comment_id uuid constraint notifications_related_comment_id_fkey references public.forum_comments (id) on delete cascade,
  related_message_id uuid constraint notifications_related_message_id_fkey references public.messages (id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_content_not_blank check (length(btrim(content)) > 0),
  constraint notifications_not_self check (user_id <> actor_id)
);

create index if not exists idx_forum_comments_post_id on public.forum_comments (forum_post_id);
create index if not exists idx_forum_comments_user_id on public.forum_comments (user_id);
create index if not exists idx_forum_comments_parent_id on public.forum_comments (parent_comment_id);
create index if not exists idx_forum_comments_created_at on public.forum_comments (created_at);

create index if not exists idx_messages_sender_id on public.messages (sender_id);
create index if not exists idx_messages_receiver_id on public.messages (receiver_id);
create index if not exists idx_messages_participants_created_at on public.messages (sender_id, receiver_id, created_at desc);
create index if not exists idx_messages_unread_receiver on public.messages (receiver_id, is_read) where is_read = false;

create index if not exists idx_notifications_user_id_created_at on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_id_unread on public.notifications (user_id, is_read) where is_read = false;
create index if not exists idx_notifications_actor_id on public.notifications (actor_id);
create index if not exists idx_notifications_related_post_id on public.notifications (related_post_id);
create index if not exists idx_notifications_related_comment_id on public.notifications (related_comment_id);
create index if not exists idx_notifications_related_message_id on public.notifications (related_message_id);

create or replace function public.validate_forum_comment_parent()
returns trigger
language plpgsql
as $$
declare
  parent_post_id uuid;
begin
  if new.parent_comment_id is null then
    return new;
  end if;

  select forum_post_id
    into parent_post_id
  from public.forum_comments
  where id = new.parent_comment_id;

  if parent_post_id is null then
    raise exception 'Parent comment does not exist.' using errcode = '23503';
  end if;

  if parent_post_id <> new.forum_post_id then
    raise exception 'Replies must belong to the same forum post as their parent.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.protect_forum_comment_update()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.forum_post_id <> old.forum_post_id
    or new.user_id <> old.user_id
    or new.parent_comment_id is distinct from old.parent_comment_id
    or new.created_at <> old.created_at
  then
    raise exception 'Only comment content can be updated.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.protect_message_read_update()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.sender_id <> old.sender_id
    or new.receiver_id <> old.receiver_id
    or new.content <> old.content
    or new.created_at <> old.created_at
  then
    raise exception 'Only message read status can be updated.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.protect_notification_read_update()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
    or new.user_id <> old.user_id
    or new.actor_id is distinct from old.actor_id
    or new.type <> old.type
    or new.related_post_id is distinct from old.related_post_id
    or new.related_comment_id is distinct from old.related_comment_id
    or new.related_message_id is distinct from old.related_message_id
    or new.content <> old.content
    or new.created_at <> old.created_at
  then
    raise exception 'Only notification read status can be updated.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_forum_comment_parent on public.forum_comments;
create trigger validate_forum_comment_parent
before insert or update on public.forum_comments
for each row execute function public.validate_forum_comment_parent();

drop trigger if exists protect_forum_comment_update on public.forum_comments;
create trigger protect_forum_comment_update
before update on public.forum_comments
for each row execute function public.protect_forum_comment_update();

drop trigger if exists set_forum_comments_updated_at on public.forum_comments;
create trigger set_forum_comments_updated_at
before update on public.forum_comments
for each row execute function public.set_updated_at();

drop trigger if exists protect_message_read_update on public.messages;
create trigger protect_message_read_update
before update on public.messages
for each row execute function public.protect_message_read_update();

drop trigger if exists protect_notification_read_update on public.notifications;
create trigger protect_notification_read_update
before update on public.notifications
for each row execute function public.protect_notification_read_update();

create or replace function public.can_create_notification(
  target_user_id uuid,
  actor_user_id uuid,
  notification_type text,
  post_id uuid,
  comment_id uuid,
  message_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = actor_user_id
    and target_user_id is not null
    and actor_user_id is not null
    and target_user_id <> actor_user_id
    and (
      (
        notification_type = 'direct_message'
        and message_id is not null
        and exists (
          select 1
          from public.messages m
          where m.id = message_id
            and m.sender_id = actor_user_id
            and m.receiver_id = target_user_id
        )
      )
      or (
        notification_type = 'forum_comment'
        and post_id is not null
        and comment_id is not null
        and exists (
          select 1
          from public.forum_comments c
          join public.forum_posts fp on fp.id = c.forum_post_id
          where c.id = comment_id
            and c.user_id = actor_user_id
            and fp.id = post_id
            and fp.author_id = target_user_id
        )
      )
      or (
        notification_type = 'comment_reply'
        and post_id is not null
        and comment_id is not null
        and exists (
          select 1
          from public.forum_comments c
          join public.forum_comments parent on parent.id = c.parent_comment_id
          where c.id = comment_id
            and c.forum_post_id = post_id
            and c.user_id = actor_user_id
            and parent.user_id = target_user_id
        )
      )
    );
$$;

create or replace function public.notify_forum_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
  parent_owner_id uuid;
  actor_label text;
begin
  select author_id
    into post_owner_id
  from public.forum_posts
  where id = new.forum_post_id;

  if post_owner_id is null then
    return new;
  end if;

  if new.parent_comment_id is not null then
    select user_id
      into parent_owner_id
    from public.forum_comments
    where id = new.parent_comment_id;
  end if;

  select coalesce(nullif(username, ''), nullif(full_name, ''), 'A student')
    into actor_label
  from public.profiles
  where id = new.user_id;

  actor_label := coalesce(actor_label, 'A student');

  if post_owner_id <> new.user_id
    and (parent_owner_id is null or parent_owner_id <> post_owner_id)
  then
    insert into public.notifications (
      user_id,
      actor_id,
      type,
      related_post_id,
      related_comment_id,
      content
    )
    values (
      post_owner_id,
      new.user_id,
      'forum_comment',
      new.forum_post_id,
      new.id,
      actor_label || ' commented on your forum post.'
    );
  end if;

  if parent_owner_id is not null and parent_owner_id <> new.user_id then
    insert into public.notifications (
      user_id,
      actor_id,
      type,
      related_post_id,
      related_comment_id,
      content
    )
    values (
      parent_owner_id,
      new.user_id,
      'comment_reply',
      new.forum_post_id,
      new.id,
      actor_label || ' replied to your comment.'
    );
  end if;

  return new;
end;
$$;

create or replace function public.notify_direct_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_label text;
begin
  select coalesce(nullif(username, ''), nullif(full_name, ''), 'A student')
    into actor_label
  from public.profiles
  where id = new.sender_id;

  actor_label := coalesce(actor_label, 'A student');

  insert into public.notifications (
    user_id,
    actor_id,
    type,
    related_message_id,
    content
  )
  values (
    new.receiver_id,
    new.sender_id,
    'direct_message',
    new.id,
    actor_label || ' sent you a direct message.'
  );

  return new;
end;
$$;

drop trigger if exists create_notification_on_forum_comment on public.forum_comments;
create trigger create_notification_on_forum_comment
after insert on public.forum_comments
for each row execute function public.notify_forum_comment();

drop trigger if exists create_notification_on_direct_message on public.messages;
create trigger create_notification_on_direct_message
after insert on public.messages
for each row execute function public.notify_direct_message();

alter table public.forum_comments enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "students read forum comments" on public.forum_comments;
create policy "students read forum comments" on public.forum_comments
for select using (
  auth.uid() is not null
  and exists (
    select 1
    from public.forum_posts fp
    where fp.id = forum_comments.forum_post_id
  )
);

drop policy if exists "students create own forum comments" on public.forum_comments;
create policy "students create own forum comments" on public.forum_comments
for insert with check (
  auth.uid() = user_id
  and length(btrim(content)) > 0
  and exists (
    select 1
    from public.forum_posts fp
    where fp.id = forum_comments.forum_post_id
  )
);

drop policy if exists "students update own forum comments" on public.forum_comments;
create policy "students update own forum comments" on public.forum_comments
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id and length(btrim(content)) > 0);

drop policy if exists "students delete own forum comments" on public.forum_comments;
create policy "students delete own forum comments" on public.forum_comments
for delete using (auth.uid() = user_id);

drop policy if exists "students read own messages" on public.messages;
create policy "students read own messages" on public.messages
for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "students send messages as themselves" on public.messages;
create policy "students send messages as themselves" on public.messages
for insert with check (
  auth.uid() = sender_id
  and sender_id <> receiver_id
  and length(btrim(content)) > 0
  and exists (
    select 1
    from public.profiles p
    where p.id = receiver_id
  )
);

drop policy if exists "receivers update message read status" on public.messages;
create policy "receivers update message read status" on public.messages
for update using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

drop policy if exists "students read own notifications" on public.notifications;
create policy "students read own notifications" on public.notifications
for select using (auth.uid() = user_id);

drop policy if exists "students create appropriate notifications" on public.notifications;
create policy "students create appropriate notifications" on public.notifications
for insert with check (
  public.can_create_notification(
    user_id,
    actor_id,
    type,
    related_post_id,
    related_comment_id,
    related_message_id
  )
);

drop policy if exists "students update own notification read status" on public.notifications;
create policy "students update own notification read status" on public.notifications
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);
