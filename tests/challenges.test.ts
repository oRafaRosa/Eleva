import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRepository } from "../src/services/demoRepository";
import {
  gymratsUrl,
  validateChallengeDraft,
} from "../src/services/challengeValidation";
const draft = {
  title: "Caminhadas da semana",
  description: "Combine sua participação com a equipe.",
  starts_on: "2026-10-14",
  ends_on: "2026-10-21",
  status: "published" as const,
  gymrats_url: "https://www.gymrats.app/",
};
const store = () => {
  const m = new Map<string, string>();
  return {
    getItem: async (k: string) => m.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      m.set(k, v);
    },
  };
};
test("admin cadastra, edita e arquiva desafios persistidos; integrante não altera", async () => {
  const s = store(),
    admin = createDemoRepository("rebeca", s),
    member = createDemoRepository("marina", s);
  await assert.rejects(member.saveChallenge(draft));
  const c = await admin.saveChallenge(draft);
  assert.ok(
    (await member.listChallenges()).some(
      (item) => item.id === c.id && item.gymrats_url === draft.gymrats_url,
    ),
  );
  await admin.saveChallenge({
    ...c,
    title: "Título revisado",
    status: "draft",
  });
  assert.ok(!(await member.listChallenges()).some((item) => item.id === c.id));
  await admin.saveChallenge({ ...c, status: "archived" });
  assert.equal(
    (await createDemoRepository("rebeca", s).listChallenges()).find(
      (item) => item.id === c.id,
    )?.status,
    "archived",
  );
  assert.ok(
    (await admin.listChallenges()).some((item) => item.id === "demo-challenge"),
  );
});
test("links GymRats são opcionais, HTTPS e restritos aos hosts verificados", () => {
  assert.equal(gymratsUrl(""), null);
  assert.equal(
    gymratsUrl("https://share.gymrats.app/"),
    "https://share.gymrats.app/",
  );
  for (const url of [
    "http://gymrats.app/",
    "https://gymrats.app.example.com/",
    "https://evil.app/?next=gymrats.app",
    "https://user:pass@gymrats.app/",
    "https://share.gymrats.app:8443/",
    "https://random.gymrats.app/",
    "javascript:alert(1)",
  ])
    assert.throws(() => gymratsUrl(url));
  assert.throws(() =>
    validateChallengeDraft({ ...draft, ends_on: "2026-10-13" }),
  );
  assert.throws(() =>
    validateChallengeDraft({ ...draft, starts_on: "2026-02-30" }),
  );
});
test("SQL aceita link oficial e RLS bloqueia cadastro por integrante", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { readFile } = await import("node:fs/promises");
  const db = new PGlite();
  try {
    for (const p of [
      "../supabase/tests/platform-shim.sql",
      "../supabase/migrations/20261013173229_eleva_foundation.sql",
      "../supabase/migrations/20261014093752_gymrats_challenges.sql",
    ])
      await db.exec(await readFile(new URL(p, import.meta.url), "utf8"));
    await db.exec(
      `insert into auth.users(id)values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');insert into public.user_access(user_id,role,active)values('00000000-0000-0000-0000-000000000001','admin',true),('00000000-0000-0000-0000-000000000002','member',true);set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);`,
    );
    const sql =
      "insert into public.challenges(title,description,starts_on,ends_on,status,gymrats_url)values('Desafio','Descrição','2026-10-14','2026-10-21','published','https://www.gymrats.app/')";
    await assert.rejects(db.exec(sql));
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false)",
    );
    await db.exec(sql);
    await assert.rejects(
      db.exec(
        sql.replace(
          "https://www.gymrats.app/",
          "https://gymrats.app.evil.com/",
        ),
      ),
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false)",
    );
    assert.equal(
      (await db.query("select * from public.challenges")).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
