import test from "node:test";
import assert from "node:assert/strict";
import { createDemoForum, forumText } from "../src/services/forum";
const make = () => {
  const map = new Map<string, string>();
  return {
    getItem: async (k: string) => map.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      map.set(k, v);
    },
  };
};
const marina = { id: "marina", full_name: "Marina", role: "member" as const };
const rebeca = { id: "rebeca", full_name: "Rebeca", role: "admin" as const };
test("conversas e respostas persistem com autoria distinta", async () => {
  const store = make(),
    a = createDemoForum(marina, store),
    b = createDemoForum(rebeca, store);
  const topic = await a.createTopic(
    "Como foi a semana?",
    "Quero conhecer vocês.",
  );
  await b.reply(topic.id, "Podemos conversar por aqui.");
  assert.equal((await b.listTopics())[0].author_name, "Marina");
  assert.equal((await a.listReplies(topic.id))[0].author_name, "Rebeca");
  assert.equal((await createDemoForum(marina, store).listTopics()).length, 1);
});
test("integrante não remove mensagem alheia, admin modera e preserva respostas", async () => {
  const store = make(),
    a = createDemoForum(marina, store),
    b = createDemoForum(rebeca, store);
  const topic = await b.createTopic("Conversa", "Mensagem");
  await assert.rejects(a.remove("topic", topic.id));
  const reply = await a.reply(topic.id, "Resposta");
  await b.remove("reply", reply.id);
  assert.equal((await a.listReplies(topic.id))[0].body, "");
  await b.remove("topic", topic.id);
  assert.equal((await a.listTopics())[0].title, "Conversa removida");
  assert.equal((await a.listReplies(topic.id)).length, 1);
  await assert.rejects(a.reply(topic.id, "Nova resposta"));
});
test("remoção própria, limites e denúncias repetidas", async () => {
  const store = make(),
    a = createDemoForum(marina, store);
  assert.throws(() => forumText(" ", 120, "Título"));
  assert.throws(() => forumText("x".repeat(121), 120, "Título"));
  const topic = await a.createTopic("Título", "Mensagem");
  await a.report("topic", topic.id);
  await a.report("topic", topic.id);
  const raw = JSON.parse((await store.getItem("eleva:forum:v1"))!);
  assert.equal(raw.reports.length, 1);
  await a.remove("topic", topic.id);
  assert.equal((await a.listTopics())[0].deleted, true);
});

test("SQL: fórum restringe acesso, autoria, remoção e denúncias", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { readFile } = await import("node:fs/promises");
  const db = new PGlite();
  try {
    await db.exec(
      await readFile(
        new URL("../supabase/tests/platform-shim.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20261013173229_eleva_foundation.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20261013182450_member_forum.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(`insert into auth.users(id)values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003');
   insert into public.profiles(id,full_name)values('00000000-0000-0000-0000-000000000001','Rebeca'),('00000000-0000-0000-0000-000000000002','Marina');
   insert into public.user_access(user_id,role,active)values('00000000-0000-0000-0000-000000000001','admin',true),('00000000-0000-0000-0000-000000000002','member',true);
   set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
   insert into public.forum_topics(id,author_id,author_name,title,body)values('10000000-0000-0000-0000-000000000001',auth.uid(),'Nome falso','Conversa','Mensagem');`);
    assert.equal(
      (
        await db.query<{ author_name: string }>(
          "select author_name from public.forum_topics",
        )
      ).rows[0].author_name,
      "Marina",
    );
    await assert.rejects(
      db.exec(
        "update public.forum_topics set author_id='00000000-0000-0000-0000-000000000001'",
      ),
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false)",
    );
    assert.equal(
      (await db.query("select * from public.forum_topics")).rows.length,
      0,
    );
    await assert.rejects(
      db.exec(
        "insert into public.forum_topics(author_id,title,body)values(auth.uid(),'Título','Mensagem')",
      ),
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false)",
    );
    await db.exec(
      "insert into public.forum_replies(topic_id,author_id,body)values('10000000-0000-0000-0000-000000000001',auth.uid(),'Resposta');insert into public.forum_reports(reporter_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001')",
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);update public.forum_replies set deleted=true,body=''",
    );
    assert.equal(
      (
        await db.query<{ deleted: boolean }>(
          "select deleted from public.forum_replies",
        )
      ).rows[0].deleted,
      false,
    );
    assert.equal(
      (await db.query("select * from public.forum_reports")).rows.length,
      0,
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);update public.forum_topics set deleted=true,body='';update public.forum_replies set deleted=true,body=''",
    );
    assert.equal(
      (
        await db.query<{ deleted: boolean }>(
          "select deleted from public.forum_topics",
        )
      ).rows[0].deleted,
      true,
    );
    await assert.rejects(
      db.exec(
        "insert into public.forum_replies(topic_id,author_id,body)values('10000000-0000-0000-0000-000000000001',auth.uid(),'Resposta nova')",
      ),
    );
  } finally {
    await db.close();
  }
});
