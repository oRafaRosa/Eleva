-- Hosted Supabase provides pg_cron. This migration fails clearly if unavailable.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('eleva-publish-due', '* * * * *', 'select eleva_private.publish_due();');
