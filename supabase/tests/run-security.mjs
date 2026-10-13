import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

// No persistent path and no network connection: every run gets a disposable DB.
const db = new PGlite();
const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');
try {
  await db.exec(await read('./platform-shim.sql'));
  await db.exec(await read('../migrations/20261013173229_eleva_foundation.sql'));
  await db.exec(await read('./security.sql'));
  console.log('PASS: 13 SQL security assertions in disposable PGlite.');
  console.log('Not tested here: real Supabase Auth, REST, signed URLs, uploads, pg_cron or concurrent transactions.');
} finally {
  await db.close();
}
