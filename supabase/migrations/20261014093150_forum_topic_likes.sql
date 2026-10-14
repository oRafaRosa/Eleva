begin;
create table public.forum_likes (
 user_id uuid not null references auth.users(id) on delete cascade,
 topic_id uuid not null references public.forum_topics(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,topic_id)
);
create index forum_likes_topic_idx on public.forum_likes(topic_id);
alter table public.forum_likes enable row level security;
revoke all on public.forum_likes from public,anon,authenticated;
grant select,insert,delete on public.forum_likes to authenticated;
create policy likes_member_read on public.forum_likes for select to authenticated using(
 (select eleva_private.is_member()) and exists(select 1 from public.forum_topics where id=topic_id and not deleted)
);
create policy likes_own_insert on public.forum_likes for insert to authenticated with check(
 (select eleva_private.is_member()) and user_id=(select auth.uid()) and exists(select 1 from public.forum_topics where id=topic_id and not deleted)
);
create policy likes_own_delete on public.forum_likes for delete to authenticated using(
 (select eleva_private.is_member()) and user_id=(select auth.uid())
);
-- Aggregation stays in PostgreSQL, avoiding API row limits when a topic is popular.
-- security_invoker preserves topic, reply and like RLS for the calling member.
create view public.forum_topic_stats with (security_invoker=true) as
select t.*,
 coalesce(l.like_count,0)::integer as like_count,
 coalesce(l.liked_by_me,false) as liked_by_me,
 coalesce(r.comment_count,0)::integer as comment_count
from public.forum_topics t
left join (
 select topic_id,count(*) as like_count,bool_or(user_id=(select auth.uid())) as liked_by_me
 from public.forum_likes group by topic_id
) l on l.topic_id=t.id
left join (
 select topic_id,count(*) as comment_count from public.forum_replies where not deleted group by topic_id
) r on r.topic_id=t.id;
revoke all on public.forum_topic_stats from public,anon,authenticated;
grant select on public.forum_topic_stats to authenticated;
commit;
