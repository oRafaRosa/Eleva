import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
const db = new PGlite();
const read = (relative) => readFile(new URL(relative, import.meta.url), "utf8");
try {
  await db.exec(await read("./platform-shim.sql"));
  await db.exec(
    await read("../migrations/20261013173229_eleva_foundation.sql"),
  );
  await db.exec(
    await read("../migrations/20261014093246_editable_profiles.sql"),
  );
  await db.exec(`
 insert into auth.users(id) values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
 insert into public.profiles(id,full_name) values('00000000-0000-0000-0000-000000000001','Marina'),('00000000-0000-0000-0000-000000000002','Rebeca');
 set role authenticated;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
 update public.profiles set full_name='Marina Silva',phone='(11) 99999-0000',city='São Paulo' where id=auth.uid();
 do $$begin
 if (select full_name from public.profiles where id=auth.uid())<>'Marina Silva' then raise exception 'Perfil próprio não editado';end if;
 if (select count(*) from public.profiles)<>1 then raise exception 'Perfil alheio visível';end if;
 update public.profiles set full_name='Invadido' where id='00000000-0000-0000-0000-000000000002';
 begin update public.profiles set id='00000000-0000-0000-0000-000000000002' where id=auth.uid();raise exception 'Identidade alterada';exception when insufficient_privilege then null;end;
 begin update public.profiles set avatar_path='00000000-0000-0000-0000-000000000002/photo.jpg' where id=auth.uid();raise exception 'Avatar alheio usado';exception when check_violation then null;end;
 begin update public.profiles set phone='invalid' where id=auth.uid();raise exception 'Telefone inválido aceito';exception when check_violation then null;end;
 end $$;
 insert into storage.objects(bucket_id,name)values('eleva-avatars','00000000-0000-0000-0000-000000000001/photo.jpg');
 do $$begin
 begin insert into storage.objects(bucket_id,name)values('eleva-avatars','00000000-0000-0000-0000-000000000002/photo.jpg');raise exception 'Upload alheio aceito';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name)values('eleva-avatars','00000000-0000-0000-0000-000000000001/photo.svg');raise exception 'Extensão ativa aceita';exception when insufficient_privilege then null;end;
 end $$;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
 do $$begin
 if (select count(*) from storage.objects where bucket_id='eleva-avatars')<>0 then raise exception 'Avatar alheio visível';end if;
 if (select full_name from public.profiles where id=auth.uid())<>'Rebeca' then raise exception 'Perfil alheio alterado';end if;
 end $$;
 reset role;
 do $$begin if (select public from storage.buckets where id='eleva-avatars') then raise exception 'Bucket público';end if;end $$;
 `);
  console.log(
    "PASS: profile ownership, immutable id, validation, private avatar paths and RLS in disposable PGlite.",
  );
  console.log(
    "Not tested: hosted Supabase uploads, signed URLs or device picker.",
  );
} finally {
  await db.close();
}
