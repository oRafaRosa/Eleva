import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRepository } from "../src/services/demoRepository";
import { createDemoForum } from "../src/services/forum";
function memory() {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
test("Jeice é o nome padrão e a mudança preserva identidade e atividades antigas", async () => {
  const storage = memory();
  const repository = createDemoRepository("marina", storage);
  assert.equal((await repository.getProfile())?.full_name, "Jeice");
  const publications = await repository.listPublications();
  await storage.setItem(
    "eleva:demo:v1",
    JSON.stringify({
      publications,
      activities: {
        marina: {
          favoriteIds: ["demo-training"],
          completionIds: ["demo-lesson"],
          eventIds: [],
          stepIds: [],
        },
      },
      profiles: {
        marina: {
          id: "demo-marina",
          full_name: "Marina",
          avatar_path: null,
          phone: "11999991234",
          city: "São Paulo",
        },
      },
    }),
  );
  const migrated = createDemoRepository("marina", storage);
  const profile = (await migrated.getProfile())!;
  assert.equal(profile.full_name, "Jeice");
  assert.equal(profile.id, "demo-marina");
  assert.equal(profile.phone, "11999991234");
  assert.deepEqual((await migrated.getActivity()).favoriteIds, [
    "demo-training",
  ]);
  assert.equal((await migrated.getAccess())?.role, "member");
  await migrated.updateProfile({ full_name: "Marina", city: "São Paulo" });
  assert.equal(
    (await createDemoRepository("marina", storage).getProfile())?.full_name,
    "Marina",
  );
  assert.equal(
    (await createDemoRepository("rebeca", storage).getProfile())?.full_name,
    "Rebeca",
  );
});
test("a troca do nome padrão não sobrescreve nomes personalizados", async () => {
  const storage = memory();
  const repository = createDemoRepository("marina", storage);
  const publications = await repository.listPublications();
  await storage.setItem(
    "eleva:demo:v1",
    JSON.stringify({
      publications,
      activities: {},
      profiles: {
        marina: {
          id: "demo-marina",
          full_name: "Jeice Silva",
          avatar_path: null,
        },
      },
    }),
  );
  assert.equal((await repository.getProfile())?.full_name, "Jeice Silva");
});
test("autoria antiga da conta de testes mostra Jeice sem alterar publicação e comentários", async () => {
  const storage = memory();
  const topic = {
    id: "old-topic",
    title: "Título",
    body: "Mensagem",
    author_id: "demo-marina",
    author_name: "Marina",
    deleted: false,
    created_at: "2026-10-14T10:00:00Z",
  };
  const reply = {
    id: "old-reply",
    topic_id: topic.id,
    body: "Comentário",
    author_id: "demo-marina",
    author_name: "Marina",
    deleted: false,
    created_at: "2026-10-14T10:01:00Z",
  };
  await storage.setItem(
    "eleva:forum:v1",
    JSON.stringify({
      topics: [topic],
      replies: [reply],
      likes: [],
      reports: [],
    }),
  );
  const forum = createDemoForum(
    { id: "demo-marina", full_name: "Jeice", role: "member" },
    storage,
  );
  const visible = (await forum.listTopics())[0];
  assert.equal(visible.author_name, "Jeice");
  assert.equal(visible.body, "Mensagem");
  assert.equal(visible.comment_count, 1);
  assert.equal((await forum.listReplies(topic.id))[0].author_name, "Jeice");
});
