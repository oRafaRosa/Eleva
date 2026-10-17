begin;
alter table public.user_access add column plan text not null default 'free' check (plan in ('free','pro')),
 add column banned boolean not null default false,
 add column updated_at timestamptz not null default now();
update public.user_access set plan='pro' where active;
create or replace function eleva_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access where user_id=auth.uid() and role='admin' and active and not banned and (expires_at is null or expires_at>now()));
$$;
create or replace function eleva_private.is_member() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access where user_id=auth.uid() and active and not banned and (role='admin' or plan='pro') and (expires_at is null or expires_at>now()));
$$;
create function eleva_private.create_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,full_name) values(new.id,left(trim(coalesce(new.raw_user_meta_data->>'full_name','')),120)) on conflict(id) do nothing;
 insert into public.user_access(user_id,role,active,plan,banned) values(new.id,'member',false,'free',false) on conflict(user_id) do nothing;
 return new;
end; $$;
revoke all on function eleva_private.create_account() from public,anon,authenticated;
create trigger eleva_account_created after insert on auth.users for each row execute function eleva_private.create_account();
insert into public.profiles(id,full_name) select id,left(trim(coalesce(raw_user_meta_data->>'full_name','')),120) from auth.users on conflict(id) do nothing;
insert into public.user_access(user_id) select id from auth.users on conflict(user_id) do nothing;
-- Ownership alone must not preserve content access after revocation or ban.
do $$ declare t text; begin
 foreach t in array array['publications','events','challenges','challenge_steps','favorites','completions','event_registrations','challenge_progress','forum_topics','forum_replies','forum_reports','forum_likes'] loop
 execute format('create policy paid_access_required on public.%I as restrictive for all to authenticated using ((select eleva_private.is_member())) with check ((select eleva_private.is_member()))',t);
 end loop;
end $$;
create table public.access_audit (
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id),
 target_id uuid not null references auth.users(id), action text not null,
 before_state jsonb not null, after_state jsonb not null, created_at timestamptz not null default now()
);
create index access_audit_actor_idx on public.access_audit(actor_id);
create index access_audit_target_idx on public.access_audit(target_id,created_at desc);
alter table public.access_audit enable row level security;
revoke all on public.access_audit from public,anon,authenticated;
grant select on public.access_audit to authenticated;
create policy admin_audit_read on public.access_audit for select to authenticated using((select eleva_private.is_admin()));
-- Privileged implementation lives outside the exposed schema; wrappers are invokers.
create function eleva_private.list_members(search_text text, page_offset integer)
returns table(user_id uuid,full_name text,email text,plan text,banned boolean,role text,active boolean,expires_at timestamptz,created_at timestamptz,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if not eleva_private.is_admin() then raise exception 'Acesso de administradora necessário' using errcode='42501';end if;
 return query select a.user_id,p.full_name,u.email::text,a.plan,a.banned,a.role,a.active,a.expires_at,a.created_at,count(*) over()
 from public.user_access a join public.profiles p on p.id=a.user_id join auth.users u on u.id=a.user_id
 where coalesce(search_text,'')='' or p.full_name ilike '%'||left(search_text,120)||'%' or u.email ilike '%'||left(search_text,120)||'%'
 order by a.created_at desc,a.user_id limit 50 offset greatest(coalesce(page_offset,0),0);
end; $$;
create function public.admin_list_members(search_text text default '',page_offset integer default 0)
returns table(user_id uuid,full_name text,email text,plan text,banned boolean,role text,active boolean,expires_at timestamptz,created_at timestamptz,total_count bigint)
language sql security invoker set search_path='' as $$ select * from eleva_private.list_members(search_text,page_offset); $$;
create function eleva_private.change_member(target_id uuid,action_name text) returns void
language plpgsql security definer set search_path='' as $$
declare previous public.user_access; current_state public.user_access;
begin
 -- Serialize admin changes so concurrent requests cannot remove the last admin.
 perform pg_advisory_xact_lock(583723190);
 if not eleva_private.is_admin() then raise exception 'Acesso de administradora necessário' using errcode='42501';end if;
 select * into previous from public.user_access where user_id=target_id for update;
 if not found then raise exception 'Conta não encontrada';end if;
 if target_id=auth.uid() then raise exception 'Use outra administradora para alterar seu próprio acesso';end if;
 if action_name not in ('grant_pro','revoke_pro','ban','unban') then raise exception 'Ação inválida';end if;
 if previous.role='admin' and action_name in ('ban','revoke_pro') then raise exception 'Contas administradoras devem ser gerenciadas pela equipe técnica';end if;
 update public.user_access set
 plan=case when action_name='grant_pro' then 'pro' when action_name='revoke_pro' then 'free' else plan end,
 active=case when action_name='grant_pro' then true when action_name='revoke_pro' then false else active end,
 banned=case when action_name='ban' then true when action_name='unban' then false else banned end,
 expires_at=case when action_name='grant_pro' then null else expires_at end,updated_at=now()
 where user_id=target_id returning * into current_state;
 insert into public.access_audit(actor_id,target_id,action,before_state,after_state) values(auth.uid(),target_id,action_name,to_jsonb(previous),to_jsonb(current_state));
end; $$;
create function public.admin_change_member(target_id uuid,action_name text) returns void
language sql security invoker set search_path='' as $$ select eleva_private.change_member(target_id,action_name); $$;
revoke all on function eleva_private.list_members(text,integer),eleva_private.change_member(uuid,text),public.admin_list_members(text,integer),public.admin_change_member(uuid,text) from public,anon,authenticated;
grant execute on function eleva_private.list_members(text,integer),eleva_private.change_member(uuid,text),public.admin_list_members(text,integer),public.admin_change_member(uuid,text) to authenticated;
commit;
