begin;
create table public.forum_topics (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id), author_name text not null default '',
 title text not null check(length(trim(title)) between 1 and 120), body text not null,
 deleted boolean not null default false, created_at timestamptz not null default now(),
 check((deleted and body='') or (not deleted and length(trim(body)) between 1 and 3000))
);
create table public.forum_replies (
 id uuid primary key default gen_random_uuid(), topic_id uuid not null references public.forum_topics(id),
 author_id uuid not null references auth.users(id),author_name text not null default '',body text not null,
 deleted boolean not null default false,created_at timestamptz not null default now(),
 check((deleted and body='') or (not deleted and length(trim(body)) between 1 and 3000))
);
create table public.forum_reports (
 id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id),
 topic_id uuid references public.forum_topics(id),reply_id uuid references public.forum_replies(id),
 created_at timestamptz not null default now(),check(num_nonnulls(topic_id,reply_id)=1)
);
create unique index report_once_topic on public.forum_reports(reporter_id,topic_id) where topic_id is not null;
create unique index report_once_reply on public.forum_reports(reporter_id,reply_id) where reply_id is not null;
create index forum_topics_author_idx on public.forum_topics(author_id);
create index forum_replies_author_idx on public.forum_replies(author_id);
create index forum_replies_topic_idx on public.forum_replies(topic_id,created_at);
create index forum_reports_topic_idx on public.forum_reports(topic_id);
create index forum_reports_reply_idx on public.forum_reports(reply_id);
create index forum_topics_created_idx on public.forum_topics(created_at desc);
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_reports enable row level security;
revoke all on public.forum_topics,public.forum_replies,public.forum_reports from public,anon,authenticated;
grant select,insert,update on public.forum_topics,public.forum_replies to authenticated;
grant select,insert on public.forum_reports to authenticated;
create policy member_topics_read on public.forum_topics for select to authenticated using((select eleva_private.is_member()));
create policy member_topics_insert on public.forum_topics for insert to authenticated with check((select eleva_private.is_member()) and author_id=(select auth.uid()) and not deleted);
create policy topics_owner_update on public.forum_topics for update to authenticated using((select eleva_private.is_member()) and (author_id=(select auth.uid()) or (select eleva_private.is_admin()))) with check((select eleva_private.is_member()) and (author_id=(select auth.uid()) or (select eleva_private.is_admin())));
create policy member_replies_read on public.forum_replies for select to authenticated using((select eleva_private.is_member()));
create policy member_replies_insert on public.forum_replies for insert to authenticated with check((select eleva_private.is_member()) and author_id=(select auth.uid()) and not deleted and exists(select 1 from public.forum_topics where id=topic_id and not deleted));
create policy replies_owner_update on public.forum_replies for update to authenticated using((select eleva_private.is_member()) and (author_id=(select auth.uid()) or (select eleva_private.is_admin()))) with check((select eleva_private.is_member()) and (author_id=(select auth.uid()) or (select eleva_private.is_admin())));
create policy reports_read on public.forum_reports for select to authenticated using((select eleva_private.is_admin()) or reporter_id=(select auth.uid()));
create policy reports_insert on public.forum_reports for insert to authenticated with check((select eleva_private.is_member()) and reporter_id=(select auth.uid()) and ((topic_id is not null and exists(select 1 from public.forum_topics where id=topic_id and not deleted)) or (reply_id is not null and exists(select 1 from public.forum_replies where id=reply_id and not deleted))));
-- Server supplies display identity; updates can only remove content, preserving authorship.
create function eleva_private.guard_forum_author() returns trigger language plpgsql set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Entre na sua conta' using errcode='42501';end if;
 if tg_op='INSERT' then
  if new.author_id <> auth.uid() then raise exception 'Autoria inválida' using errcode='42501';end if;
  select coalesce(nullif(full_name,''),'Integrante ELEVA') into new.author_name from public.profiles where id=auth.uid();
  new.author_name=coalesce(new.author_name,'Integrante ELEVA');new.created_at=now();
 else
  if new.author_id <> old.author_id or new.author_name <> old.author_name or new.created_at <> old.created_at or (tg_table_name='forum_replies' and to_jsonb(new)->>'topic_id' <> to_jsonb(old)->>'topic_id') then raise exception 'Autoria não pode ser alterada' using errcode='42501';end if;
  if not new.deleted then raise exception 'Somente remoção está disponível' using errcode='42501';end if;
  new.body='';if tg_table_name='forum_topics' then new.title='Conversa removida';end if;
 end if;
 return new;
end $$;
revoke all on function eleva_private.guard_forum_author() from public;
create trigger guard_topic before insert or update on public.forum_topics for each row execute function eleva_private.guard_forum_author();
create trigger guard_reply before insert or update on public.forum_replies for each row execute function eleva_private.guard_forum_author();
commit;
