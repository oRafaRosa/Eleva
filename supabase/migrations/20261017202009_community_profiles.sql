begin;
alter table public.profiles add column whatsapp_public boolean not null default false;
alter table public.profiles add constraint profile_public_whatsapp_valid check (
 not whatsapp_public or (phone is not null and length(regexp_replace(phone,'[^0-9]','','g')) between 10 and 15)
);
grant update(whatsapp_public) on public.profiles to authenticated;
-- Use a literal dot class consistently, including on projects with escaped legacy patterns.
alter table public.profiles drop constraint profile_avatar_owner;
alter table public.profiles add constraint profile_avatar_owner check (
 avatar_path is null or (avatar_path like id::text || '/%' and avatar_path ~ '^[a-f0-9-]+/[A-Za-z0-9-]+[.]jpg$')
);
alter policy avatar_insert_own on storage.objects with check (
 bucket_id='eleva-avatars' and split_part(name,'/',1)=(select auth.uid())::text
 and name ~ '^[a-f0-9-]+/[A-Za-z0-9-]+[.]jpg$'
);

-- Raw profiles stay private. This projection intentionally omits phone unless opted in,
-- city, e-mail and access roles. Both caller and subject must have current club access.
create function eleva_private.community_profiles(profile_ids uuid[])
returns table(id uuid,full_name text,avatar_path text,joined_at timestamptz,whatsapp text)
language sql stable security definer set search_path='' as $$
 select p.id,p.full_name,p.avatar_path,p.created_at,
 case when p.whatsapp_public then p.phone else null end
 from public.profiles p join public.user_access a on a.user_id=p.id
 where auth.uid() is not null and eleva_private.is_member()
 and p.id=any(profile_ids[1:100])
 and a.active and not a.banned and (a.role='admin' or a.plan='pro')
 and (a.expires_at is null or a.expires_at>now());
$$;
create function public.community_profiles(profile_ids uuid[])
returns table(id uuid,full_name text,avatar_path text,joined_at timestamptz,whatsapp text)
language sql stable security invoker set search_path='' as $$
 select * from eleva_private.community_profiles(profile_ids);
$$;
revoke all on function eleva_private.community_profiles(uuid[]),public.community_profiles(uuid[]) from public,anon,authenticated;
grant execute on function eleva_private.community_profiles(uuid[]),public.community_profiles(uuid[]) to authenticated;

create function eleva_private.can_read_community_avatar(object_name text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and eleva_private.is_member() and exists(
 select 1 from public.profiles p join public.user_access a on a.user_id=p.id
 where p.avatar_path=object_name and a.active and not a.banned
 and (a.role='admin' or a.plan='pro') and (a.expires_at is null or a.expires_at>now())
 );
$$;
revoke all on function eleva_private.can_read_community_avatar(text) from public,anon,authenticated;
grant execute on function eleva_private.can_read_community_avatar(text) to authenticated;
create policy avatar_read_community on storage.objects for select to authenticated using(
 bucket_id='eleva-avatars' and eleva_private.can_read_community_avatar(name)
);
create index profiles_avatar_path_idx on public.profiles(avatar_path) where avatar_path is not null;
create index forum_topics_author_visible_idx on public.forum_topics(author_id,created_at desc) where not deleted;
-- Rank in PostgreSQL, before LIMIT: each like and each visible comment contributes one point.
create function public.community_profile_posts(profile_id uuid)
returns setof public.forum_topic_stats language sql stable security invoker set search_path='' as $$
 select t.* from public.forum_topic_stats t
 where t.author_id=profile_id and not t.deleted
 and exists(select 1 from public.community_profiles(array[profile_id]))
 order by (t.like_count+t.comment_count) desc,t.created_at desc,t.id
 limit 6;
$$;
revoke all on function public.community_profile_posts(uuid) from public,anon,authenticated;
grant execute on function public.community_profile_posts(uuid) to authenticated;
commit;
