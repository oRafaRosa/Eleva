import test from "node:test";
import assert from "node:assert/strict";
import {
  whatsappUrl,
  clubTenure,
  topCommunityPosts,
} from "../src/services/communityProfileUtils";
import { attachAuthors } from "../src/services/communityProfiles";
import { validateProfileUpdate } from "../src/services/profileValidation";
import type { ForumTopic } from "../src/types/forum";
const topic = (
  id: string,
  likes: number,
  comments: number,
  date = "2026-10-10T12:00:00Z",
): ForumTopic => ({
  id,
  author_id: "person",
  author_name: "Nome antigo",
  title: id,
  body: "Texto",
  deleted: false,
  created_at: date,
  like_count: likes,
  comment_count: comments,
});
test("perfil usa identidade atual e não inventa foto para autora indisponível", () => {
  const items = attachAuthors(
    [topic("a", 0, 0)],
    [
      {
        id: "person",
        full_name: "Nome novo",
        avatar_path: "person/a.jpg",
        avatar_url: "https://example.invalid/a",
        joined_at: "2026-10-10",
        whatsapp: null,
      },
    ],
  );
  assert.equal(items[0].author_name, "Nome novo");
  assert.equal(items[0].author_avatar_url, "https://example.invalid/a");
  assert.equal(items[0].author_profile_available, true);
  assert.equal(attachAuthors(items, [])[0].author_avatar_url, null);
});
test("engajamento combina curtidas e comentários, exclui removidas e limita seis", () => {
  const source = [
    topic("a", 3, 0),
    topic("b", 0, 4),
    { ...topic("deleted", 99, 99), deleted: true },
    topic("recent", 4, 0, "2026-10-12T12:00:00Z"),
    ...Array.from({ length: 8 }, (_, i) => topic("other" + i, 0, 0)),
  ];
  const top = topCommunityPosts(source);
  assert.deepEqual(
    top.slice(0, 3).map((p) => p.id),
    ["recent", "b", "a"],
  );
  assert.equal(top.length, 6);
  assert.equal(source.length, 12);
});
test("WhatsApp exige opção explícita e um número completo", () => {
  assert.equal(
    validateProfileUpdate({ full_name: "Nome", phone: "(11) 99999-1234" })
      .whatsapp_public,
    undefined,
  );
  assert.equal(
    validateProfileUpdate({ full_name: "Nome", whatsapp_public: false })
      .whatsapp_public,
    false,
  );
  assert.throws(
    () =>
      validateProfileUpdate({
        full_name: "Nome",
        phone: "123",
        whatsapp_public: true,
      }),
    /DDD/,
  );
  assert.throws(
    () =>
      validateProfileUpdate({
        full_name: "Nome",
        whatsapp_public: "true",
      } as any),
    /visibilidade/,
  );
  assert.equal(whatsappUrl("(11) 99999-1234"), "https://wa.me/5511999991234");
  assert.equal(whatsappUrl("+1 (212) 555-1234"), "https://wa.me/12125551234");
  assert.equal(whatsappUrl("+55 11 99999-1234"), "https://wa.me/5511999991234");
  assert.equal(whatsappUrl(null), null);
  assert.equal(whatsappUrl("123"), null);
});
test("tempo de clube respeita o dia local e datas inválidas", () => {
  const now = new Date("2026-10-17T13:00:00Z");
  assert.equal(clubTenure("2026-10-17T04:00:00Z", now), "No clube desde hoje");
  assert.equal(clubTenure("2026-10-16T13:00:00Z", now), "1 dia de clube");
  assert.equal(clubTenure("2026-10-10T13:00:00Z", now), "7 dias de clube");
  assert.equal(clubTenure("", now), "");
});

test("foto e nome atualizados chegam aos posts e comentários existentes na demonstração", async () => {
  const { createDemoRepository } =
    await import("../src/services/demoRepository");
  const { createDemoForum } = await import("../src/services/forum");
  const { getCommunityProfiles } =
    await import("../src/services/communityProfiles");
  const data = new Map<string, string>();
  const store = {
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      data.set(k, v);
    },
  };
  const user = {
    id: "demo-marina",
    full_name: "Jeice",
    role: "member" as const,
  };
  const forum = createDemoForum(user, store);
  const post = await forum.createTopic("Conversa", "Olá");
  await forum.reply(post.id, "Comentário");
  const repo = createDemoRepository("marina", store);
  const jpeg = Buffer.from([255, 216, 255, 217]).toString("base64");
  await repo.updateProfile({
    full_name: "Nome atualizado",
    avatar_base64: jpeg,
    phone: "11999991234",
    whatsapp_public: false,
  });
  assert.equal(
    (await forum.listTopics())[0].author_avatar_url,
    "data:image/jpeg;base64," + jpeg,
  );
  assert.equal(
    (await forum.listReplies(post.id))[0].author_name,
    "Nome atualizado",
  );
  assert.equal(
    (await getCommunityProfiles([user.id], true, store))[0].whatsapp,
    null,
  );
  await repo.updateProfile({
    full_name: "Nome atualizado",
    phone: "11999991234",
    whatsapp_public: true,
  });
  assert.equal(
    (await getCommunityProfiles([user.id], true, store))[0].whatsapp,
    "11999991234",
  );
  await repo.updateProfile({
    full_name: "Nome atualizado",
    phone: "11999991234",
    whatsapp_public: false,
    avatar_base64: null,
  });
  assert.equal((await forum.listTopics())[0].author_avatar_url, null);
});
