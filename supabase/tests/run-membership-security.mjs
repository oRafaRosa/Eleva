import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
const db=new PGlite();
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
try {
 await db.exec(await read('./platform-shim.sql'));
 await db.exec(`alter table auth.users add column email text,add column raw_user_meta_data jsonb default '{}'::jsonb;`);
 for(const name of (await readdir(new URL('../migrations/',import.meta.url))).sort()) {
  if(name.endsWith('.sql')&&!name.includes('enable_editorial_cron')) await db.exec(await read('../migrations/'+name));
 }
 await db.exec(`
 insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000001','admin@example.invalid','{"full_name":"Admin"}'),
 ('00000000-0000-0000-0000-000000000002','free@example.invalid','{"full_name":"Free","role":"admin","plan":"pro","active":true}'),
 ('00000000-0000-0000-0000-000000000003','other@example.invalid','{"full_name":"Other"}');
 do $$begin
 if exists(select 1 from public.user_access where active or plan<>'free' or role<>'member') then raise exception 'Signup metadata escalated access';end if;
 if(select count(*) from public.profiles)<>3 then raise exception 'Missing automatic profiles';end if;
 end $$;
 update public.user_access set role='admin',active=true,plan='pro' where user_id='00000000-0000-0000-0000-000000000001';
 insert into public.publications(title,type,pillar,status) values('Protected content','lesson','mind','published');
 set role authenticated;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
 do $$begin
 if exists(select 1 from public.publications) then raise exception 'Free read content';end if;
 if(select count(*) from public.profiles)<>1 then raise exception 'Free read other profiles';end if;
 if(select count(*) from public.user_access)<>1 then raise exception 'Free read other access';end if;
 begin update public.user_access set active=true,plan='pro' where user_id=auth.uid();raise exception 'Self upgrade allowed';exception when insufficient_privilege then null;end;
 begin perform public.admin_list_members('',0);raise exception 'Free listed users';exception when insufficient_privilege then null;end;
 begin perform public.admin_change_member(auth.uid(),'grant_pro');raise exception 'Free used admin action';exception when insufficient_privilege then null;end;
 end $$;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
 do $$begin
 if(select count(*) from public.admin_list_members('',0))<>3 then raise exception 'Admin cannot list all users';end if;
 if(select count(*) from public.admin_list_members('other',0))<>1 then raise exception 'Admin search failed';end if;
 begin perform public.admin_change_member(auth.uid(),'ban');raise exception 'Self ban allowed';exception when raise_exception then if sqlerrm='Self ban allowed' then raise;end if;end;
 end $$;
 select public.admin_change_member('00000000-0000-0000-0000-000000000002','grant_pro');
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
 do $$begin if(select count(*) from public.publications)<>1 then raise exception 'PRO cannot read';end if;end $$;
 insert into public.favorites(user_id,publication_id) select auth.uid(),id from public.publications;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
 select public.admin_change_member('00000000-0000-0000-0000-000000000002','ban');
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
 do $$begin
 if exists(select 1 from public.publications) or exists(select 1 from public.favorites) or eleva_private.is_member() then raise exception 'Ban ineffective for existing session';end if;
 end $$;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
 select public.admin_change_member('00000000-0000-0000-0000-000000000002','unban');
 select public.admin_change_member('00000000-0000-0000-0000-000000000002','revoke_pro');
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
 do $$begin if exists(select 1 from public.publications) or exists(select 1 from public.favorites) then raise exception 'Revocation ineffective';end if;end $$;
 reset role;
 do $$begin
 if(select count(*) from public.access_audit)<>4 then raise exception 'Audit incomplete';end if;
 if exists(select 1 from pg_tables where schemaname='public' and not rowsecurity) then raise exception 'RLS missing';end if;
 end $$;
 `);
 console.log('PASS: automatic FREE signup, hostile metadata, own data, admin search, PRO grant/revoke, immediate ban, self-protection and audit.');
} finally { await db.close(); }
