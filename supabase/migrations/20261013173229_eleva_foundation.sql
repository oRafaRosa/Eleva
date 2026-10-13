-- ELEVA: conteúdo privado, acesso por assinatura e painel editorial.
begin;
create schema if not exists eleva_private;
revoke all on schema eleva_private from public;
grant usage on schema eleva_private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', avatar_path text,
 created_at timestamptz not null default now()
);
create table public.user_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'member' check (role in ('member','admin')),
 active boolean not null default false,
 expires_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.user_access enable row level security;
-- Only a trusted operator/webhook can grant access or administrator privileges.
grant select on public.user_access to authenticated;
create policy own_access on public.user_access for select to authenticated using (user_id = (select auth.uid()));

create function eleva_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access where user_id = auth.uid() and role = 'admin' and active and (expires_at is null or expires_at > now()));
$$;
create function eleva_private.is_member() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access where user_id = auth.uid() and active and (expires_at is null or expires_at > now()));
$$;
revoke all on function eleva_private.is_admin(), eleva_private.is_member() from public;
grant execute on function eleva_private.is_admin(), eleva_private.is_member() to authenticated;
grant select, insert, update on public.profiles to authenticated;
create policy read_profile on public.profiles for select to authenticated using(id = (select auth.uid()) or (select eleva_private.is_admin()));
create policy insert_profile on public.profiles for insert to authenticated with check(id = (select auth.uid()));
create policy update_profile on public.profiles for update to authenticated using(id = (select auth.uid())) with check(id = (select auth.uid()));

create table public.publications (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) > 0),
 summary text not null default '', body text not null default '',
 type text not null check(type in ('devotional','training','lesson','motivation','material','podcast','post')),
 pillar text not null check(pillar in ('body','mind','spirit')),
 status text not null default 'draft' check(status in ('draft','scheduled','published','archived')),
 cover_path text, media_url text, details jsonb not null default '{}'::jsonb check(jsonb_typeof(details) = 'object'),
 reference_date date, scheduled_at timestamptz, published_at timestamptz,
 created_by uuid references auth.users(id) on delete set null default auth.uid(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status <> 'scheduled' or scheduled_at is not null),
 check(type <> 'devotional' or reference_date is not null)
);
create unique index one_main_devotional_per_day on public.publications(reference_date) where type = 'devotional' and status in ('published','scheduled');
create index publications_feed_idx on public.publications(status, published_at desc);
create index publications_due_idx on public.publications(scheduled_at) where status = 'scheduled';
create index publications_creator_idx on public.publications(created_by);
alter table public.publications enable row level security;
grant select, insert, update, delete on public.publications to authenticated;
create policy read_publications on public.publications for select to authenticated using((select eleva_private.is_admin()) or (status = 'published' and published_at <= now() and (select eleva_private.is_member())));
create policy manage_publications on public.publications for all to authenticated using((select eleva_private.is_admin())) with check((select eleva_private.is_admin()));
create function eleva_private.stamp_publication() returns trigger language plpgsql set search_path = '' as $$
begin
 new.updated_at = now();
 if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then new.published_at = now(); end if;
 if new.status <> 'published' then new.published_at = null; end if;
 return new;
end; $$;
revoke all on function eleva_private.stamp_publication() from public;
create trigger stamp_publication before insert or update on public.publications for each row execute function eleva_private.stamp_publication();

create table public.favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 publication_id uuid not null references public.publications(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,publication_id)
);
create table public.completions (like public.favorites including all);
alter table public.completions add foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.completions add foreign key(publication_id) references public.publications(id) on delete cascade;
create index favorites_publication_idx on public.favorites(publication_id);
create index completions_publication_idx on public.completions(publication_id);

create table public.events (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', location text not null default '',
 starts_at timestamptz not null, ends_at timestamptz not null, capacity integer not null check(capacity > 0),
 status text not null default 'draft' check(status in ('draft','published','cancelled')), check(ends_at > starts_at)
);
create table public.event_registrations (
 user_id uuid not null references auth.users(id) on delete cascade,
 event_id uuid not null references public.events(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,event_id)
);
create index event_registrations_event_idx on public.event_registrations(event_id);
-- Trigger locks the event row, serializing concurrent requests for the last seat.
create function eleva_private.check_event_capacity() returns trigger language plpgsql security definer set search_path = '' as $$
declare event_row public.events; seats integer;
begin
 if auth.uid() is null or new.user_id <> auth.uid() or not eleva_private.is_member() then raise exception 'Acesso necessário' using errcode = '42501'; end if;
 select * into event_row from public.events where id = new.event_id for update;
 if event_row.id is null or event_row.status <> 'published' or event_row.starts_at <= now() then raise exception 'Inscrições encerradas' using errcode = 'P0001'; end if;
 select count(*) into seats from public.event_registrations where event_id = new.event_id;
 if seats >= event_row.capacity then raise exception 'Não há vagas disponíveis' using errcode = 'P0001'; end if;
 return new;
end; $$;
revoke all on function eleva_private.check_event_capacity() from public;
create trigger check_event_capacity before insert on public.event_registrations for each row execute function eleva_private.check_event_capacity();

create table public.challenges (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '',
 starts_on date not null, ends_on date not null, status text not null default 'draft' check(status in ('draft','published','archived')), check(ends_on >= starts_on)
);
create table public.challenge_steps (
 id uuid primary key default gen_random_uuid(), challenge_id uuid not null references public.challenges(id) on delete cascade,
 title text not null, position integer not null check(position > 0), unique(challenge_id,position)
);
create table public.challenge_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 step_id uuid not null references public.challenge_steps(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,step_id)
);
create index challenge_progress_step_idx on public.challenge_progress(step_id);

-- Apply content and ownership policies, plus explicit least-privilege API grants.
do $$ declare t text; begin
 foreach t in array array['events','challenges'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 execute format('create policy content_read on public.%I for select to authenticated using ((select eleva_private.is_admin()) or (status = ''published'' and (select eleva_private.is_member())))',t);
 execute format('create policy admin_write on public.%I for all to authenticated using ((select eleva_private.is_admin())) with check ((select eleva_private.is_admin()))',t);
 end loop;
 foreach t in array array['favorites','completions','event_registrations','challenge_progress'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('grant select,insert,delete on public.%I to authenticated',t);
 execute format('create policy own_read on public.%I for select to authenticated using (user_id = (select auth.uid()) or (select eleva_private.is_admin()))',t);
 execute format('create policy own_delete on public.%I for delete to authenticated using (user_id = (select auth.uid()))',t);
 end loop;
end $$;
create policy own_favorite_insert on public.favorites for insert to authenticated with check(user_id = (select auth.uid()) and (select eleva_private.is_member()) and exists(select 1 from public.publications where id = publication_id and status = 'published'));
create policy own_completion_insert on public.completions for insert to authenticated with check(user_id = (select auth.uid()) and (select eleva_private.is_member()) and exists(select 1 from public.publications where id = publication_id and status = 'published'));
create policy own_registration_insert on public.event_registrations for insert to authenticated with check(user_id = (select auth.uid()) and (select eleva_private.is_member()));
alter table public.challenge_steps enable row level security;
grant select,insert,update,delete on public.challenge_steps to authenticated;
create policy steps_read on public.challenge_steps for select to authenticated using(exists(select 1 from public.challenges where id = challenge_id));
create policy steps_admin on public.challenge_steps for all to authenticated using((select eleva_private.is_admin())) with check((select eleva_private.is_admin()));
create policy own_progress_insert on public.challenge_progress for insert to authenticated with check(user_id = (select auth.uid()) and (select eleva_private.is_member()) and exists(select 1 from public.challenge_steps s join public.challenges c on c.id = s.challenge_id where s.id = step_id and c.status = 'published' and current_date between c.starts_on and c.ends_on));

-- Private files: object paths start with publication UUID, e.g. <uuid>/guide.pdf.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('eleva-content','eleva-content',false,52428800,array['image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','video/mp4']);
create policy eleva_file_read on storage.objects for select to authenticated using(bucket_id = 'eleva-content' and ((select eleva_private.is_admin()) or exists(select 1 from public.publications p where p.id::text = split_part(name,'/',1) and p.status = 'published' and p.published_at <= now() and (select eleva_private.is_member()))));
create policy eleva_file_insert on storage.objects for insert to authenticated with check(bucket_id = 'eleva-content' and (select eleva_private.is_admin()));
create policy eleva_file_update on storage.objects for update to authenticated using(bucket_id = 'eleva-content' and (select eleva_private.is_admin())) with check(bucket_id = 'eleva-content' and (select eleva_private.is_admin()));
create policy eleva_file_delete on storage.objects for delete to authenticated using(bucket_id = 'eleva-content' and (select eleva_private.is_admin()));

-- Runs only from the database scheduler. No client role can invoke it.
create function eleva_private.publish_due() returns integer language plpgsql set search_path = '' as $$
declare total integer;
begin
 update public.publications set status = 'published' where status = 'scheduled' and scheduled_at <= now();
 get diagnostics total = row_count;
 return total;
end; $$;
revoke all on function eleva_private.publish_due() from public,anon,authenticated;
-- Override Supabase default privileges; RLS does not replace SQL grants.
revoke all on public.profiles, public.user_access, public.publications, public.favorites, public.completions, public.events, public.event_registrations, public.challenges, public.challenge_steps, public.challenge_progress from anon, authenticated, public;
grant select on public.user_access to authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.publications,public.events,public.challenges,public.challenge_steps to authenticated;
grant select,insert,delete on public.favorites,public.completions,public.event_registrations,public.challenge_progress to authenticated;
commit;
