-- Run in a disposable Supabase local database AFTER migrations, never production.
begin;
insert into auth.users(id) values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003');
insert into public.user_access(user_id,role,active) values('00000000-0000-0000-0000-000000000001','admin',true),('00000000-0000-0000-0000-000000000002','member',true),('00000000-0000-0000-0000-000000000003','member',false);
insert into public.publications(id,title,type,pillar,status) values('10000000-0000-0000-0000-000000000001','Publicado','post','mind','published'),('10000000-0000-0000-0000-000000000002','Rascunho','post','mind','draft');
insert into public.events(id,title,starts_at,ends_at,capacity,status) values('20000000-0000-0000-0000-000000000001','Encontro',now()+interval '1 day',now()+interval '2 day',1,'published');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
 if (select count(*) from public.publications) <> 1 then raise exception 'Rascunho visível para integrante';end if;
 begin
  insert into public.user_access(user_id,role,active) values(auth.uid(),'admin',true);
  raise exception 'Escalada de privilégio permitida';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.publications(title,type,pillar)values('Não autorizado','post','mind');
  raise exception 'Publicação por integrante permitida';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.favorites(user_id,publication_id)values('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001');
  raise exception 'Favorito de outra pessoa permitido';
 exception when insufficient_privilege then null;end;
end $$;
insert into public.event_registrations(user_id,event_id) values(auth.uid(),'20000000-0000-0000-0000-000000000001');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
 if (select count(*) from public.publications) <> 2 then raise exception 'Admin não vê rascunho';end if;
 begin
  insert into public.event_registrations(user_id,event_id) values(auth.uid(),'20000000-0000-0000-0000-000000000001');
  raise exception 'Lotação excedida';
 exception when raise_exception then if sqlerrm <> 'Não há vagas disponíveis' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
do $$ begin if (select count(*) from public.publications) <> 0 then raise exception 'Acesso sem assinatura ativa';end if;end $$;
do $$ begin
 begin
  perform eleva_private.publish_due();raise exception 'Agendador exposto ao cliente';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
insert into public.publications(id,title,type,pillar,status,scheduled_at) values('10000000-0000-0000-0000-000000000003','Agendado','post','mind','scheduled',now()-interval '1 minute');
do $$ begin
 if eleva_private.publish_due() <> 1 then raise exception 'Publicação agendada não executada';end if;
 if eleva_private.publish_due() <> 0 then raise exception 'Publicação duplicada';end if;
end $$;
insert into storage.objects(bucket_id,name)values('eleva-content','10000000-0000-0000-0000-000000000001/guia.pdf'),('eleva-content','10000000-0000-0000-0000-000000000002/rascunho.pdf');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin if (select count(*) from storage.objects) <> 1 then raise exception 'Arquivo de rascunho exposto';end if;end $$;
reset role;
update public.user_access set expires_at=now()-interval '1 second' where user_id='00000000-0000-0000-0000-000000000002';
set local role authenticated;
do $$ begin
 if (select count(*) from storage.objects) <> 0 then raise exception 'Arquivo exposto após expiração';end if;
 if (select count(*) from public.publications) <> 0 then raise exception 'Conteúdo exposto após expiração';end if;
end $$;
reset role;
rollback;
