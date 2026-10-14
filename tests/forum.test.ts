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

test("curtidas persistem por integrante, são idempotentes e contam respostas visíveis", async () => {
  const store = make(),
    member = createDemoForum(marina, store),
    admin = createDemoForum(rebeca, store);
  const topic = await member.createTopic("Conversar", "Uma mensagem");
  await member.setLike(topic.id, true);
  await member.setLike(topic.id, true);
  await admin.setLike(topic.id, true);
  let visible = (await member.listTopics())[0];
  assert.equal(visible.like_count, 2);
  assert.equal(visible.liked_by_me, true);
  await member.setLike(topic.id, false);
  await member.setLike(topic.id, false);
  visible = (await member.listTopics())[0];
  assert.equal(visible.like_count, 1);
  assert.equal(visible.liked_by_me, false);
  assert.equal((await admin.listTopics())[0].liked_by_me, true);
  const reply = await admin.reply(topic.id, "Resposta");
  assert.equal((await member.listTopics())[0].comment_count, 1);
  await admin.remove("reply", reply.id);
  assert.equal((await member.listTopics())[0].comment_count, 0);
  assert.equal(
    (await createDemoForum(rebeca, store).listTopics())[0].liked_by_me,
    true,
  );
  await member.remove("topic", topic.id);
  await assert.rejects(admin.setLike(topic.id, true));
  assert.equal((await admin.listTopics())[0].like_count, 0);
});

test("dados locais anteriores recebem curtidas vazias e outros armazenamentos não compartilham curtidas", async () => {
  const store = make();
  await store.setItem(
    "eleva:forum:v1",
    JSON.stringify({ topics: [], replies: [], reports: [] }),
  );
  const forum = createDemoForum(marina, store);
  const topic = await forum.createTopic("Título", "Mensagem");
  await forum.setLike(topic.id, true);
  assert.equal((await forum.listTopics())[0].like_count, 1);
  assert.equal((await createDemoForum(marina, make()).listTopics()).length, 0);
});

test("SQL: curtidas têm dono, acesso ativo e contagens sem bypass de RLS", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { readFile } = await import("node:fs/promises");
  const db = new PGlite();
  try {
    for (const path of [
      "../supabase/tests/platform-shim.sql",
      "../supabase/migrations/20261013173229_eleva_foundation.sql",
      "../supabase/migrations/20261013182450_member_forum.sql",
      "../supabase/migrations/20261014093150_forum_topic_likes.sql",
    ])
      await db.exec(await readFile(new URL(path, import.meta.url), "utf8"));
    await db.exec(`insert into auth.users(id)values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003');
   insert into public.user_access(user_id,role,active)values('00000000-0000-0000-0000-000000000001','admin',true),('00000000-0000-0000-0000-000000000002','member',true);
   set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
   insert into public.forum_topics(id,author_id,title,body)values('10000000-0000-0000-0000-000000000001',auth.uid(),'Título','Mensagem');
   insert into public.forum_likes(user_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001') on conflict do nothing;
   insert into public.forum_likes(user_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001') on conflict do nothing;
   insert into public.forum_replies(topic_id,author_id,body)values('10000000-0000-0000-0000-000000000001',auth.uid(),'Resposta');`);
    type Stats = {
      like_count: number;
      liked_by_me: boolean;
      comment_count: number;
    };
    let stats = (
      await db.query<Stats>(
        "select like_count,liked_by_me,comment_count from public.forum_topic_stats",
      )
    ).rows[0];
    assert.deepEqual(stats, {
      like_count: 1,
      liked_by_me: true,
      comment_count: 1,
    });
    await assert.rejects(
      db.exec(
        "insert into public.forum_likes(user_id,topic_id)values('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001')",
      ),
    );
    await assert.rejects(
      db.exec(
        "update public.forum_likes set user_id='00000000-0000-0000-0000-000000000001'",
      ),
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);delete from public.forum_likes;insert into public.forum_likes(user_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001')",
    );
    assert.equal(
      (await db.query<Stats>("select like_count from public.forum_topic_stats"))
        .rows[0].like_count,
      2,
    );
    await db.exec(
      "delete from public.forum_likes where user_id=auth.uid();update public.forum_replies set deleted=true,body=''",
    );
    stats = (
      await db.query<Stats>(
        "select like_count,liked_by_me,comment_count from public.forum_topic_stats",
      )
    ).rows[0];
    assert.deepEqual(stats, {
      like_count: 1,
      liked_by_me: false,
      comment_count: 0,
    });
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false)",
    );
    assert.equal(
      (await db.query("select * from public.forum_topic_stats")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.forum_likes")).rows.length,
      0,
    );
    await assert.rejects(
      db.exec(
        "insert into public.forum_likes(user_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001')",
      ),
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);update public.forum_topics set deleted=true,body=''",
    );
    await assert.rejects(
      db.exec(
        "insert into public.forum_likes(user_id,topic_id)values(auth.uid(),'10000000-0000-0000-0000-000000000001')",
      ),
    );
    assert.equal(
      (await db.query<Stats>("select like_count from public.forum_topic_stats"))
        .rows[0].like_count,
      0,
    );
  } finally {
    await db.close();
  }
});
