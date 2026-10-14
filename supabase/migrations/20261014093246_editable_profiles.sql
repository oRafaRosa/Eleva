-- Profile data is separate from access roles. Avatar objects remain private.
alter table public.profiles add column phone text, add column city text;
alter table public.profiles add constraint profile_name_length check (length(full_name) <= 120);
alter table public.profiles add constraint profile_phone_format check (phone is null or (length(phone) <= 30 and phone ~ '^[0-9+().[:space:]-]+$'));
alter table public.profiles add constraint profile_city_length check (city is null or length(city) <= 100);
alter table public.profiles add constraint profile_avatar_owner check (avatar_path is null or (avatar_path like id::text || '/%' and avatar_path ~ '^[a-f0-9-]+/[A-Za-z0-9-]+\.jpg$'));
revoke update on public.profiles from authenticated;
grant update(full_name, phone, city, avatar_path) on public.profiles to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('eleva-avatars','eleva-avatars',false,524288,array['image/jpeg'])
on conflict(id) do update set public=false,file_size_limit=524288,allowed_mime_types=array['image/jpeg'];
create policy avatar_read_own on storage.objects for select to authenticated using(bucket_id='eleva-avatars' and split_part(name,'/',1)=(select auth.uid())::text);
create policy avatar_insert_own on storage.objects for insert to authenticated with check(bucket_id='eleva-avatars' and split_part(name,'/',1)=(select auth.uid())::text and name ~ '^[a-f0-9-]+/[A-Za-z0-9-]+\.jpg$');
create policy avatar_delete_own on storage.objects for delete to authenticated using(bucket_id='eleva-avatars' and split_part(name,'/',1)=(select auth.uid())::text);
