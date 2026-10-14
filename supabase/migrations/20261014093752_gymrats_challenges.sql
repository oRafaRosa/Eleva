begin;
alter table public.challenges add column gymrats_url text;
alter table public.challenges add constraint gymrats_https_link check(
 gymrats_url is null or (length(gymrats_url)<=2048 and gymrats_url ~ '^https://(gymrats\.app|www\.gymrats\.app|share\.gymrats\.app)(/[^[:space:]]*)?$')
);
-- Hosts verified against the GymRats website/help and share invite pages on 2026-10-14.
-- No external group is created, seeded, or automatically joined.
commit;
