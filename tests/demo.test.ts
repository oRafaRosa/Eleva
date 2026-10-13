import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRepository } from "../src/services/demoRepository";
import type { PublicationDraft } from "../src/types/domain";

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
  };
};
const draft = (changes: Partial<PublicationDraft> = {}): PublicationDraft => ({
  title: "Teste editorial",
  summary: "",
  body: "Conteúdo fictício para o teste.",
  type: "post",
  pillar: "mind",
  status: "draft",
  ...changes,
});

test("integrante não salva nem arquiva conteúdo, mesmo chamando o serviço diretamente", async () => {
  const member = createDemoRepository("member", memory());
  await assert.rejects(member.savePublication(draft()), /exclusiva/);
  await assert.rejects(
    member.archivePublication("demo-devotional"),
    /exclusiva/,
  );
});

test("rascunhos e agendados ficam no admin, publicação aparece para integrante e arquivo remove", async () => {
  const storage = memory();
  const admin = createDemoRepository("admin", storage);
  const member = createDemoRepository("member", storage);
  await member.listPublications(); // A instância aberta também recebe a próxima alteração.
  const p = await admin.savePublication(draft());
  assert.equal(await member.getPublication(p.id), null);
  await admin.savePublication(
    draft({
      id: p.id,
      status: "scheduled",
      scheduled_at: "2099-10-14T10:00:00Z",
    }),
  );
  assert.equal(await member.getPublication(p.id), null);
  assert.equal((await admin.getPublication(p.id))?.status, "scheduled");
  // Cancelar o agendamento devolve ao rascunho e apaga o instante.
  await admin.savePublication(
    draft({ id: p.id, status: "draft", scheduled_at: null }),
  );
  assert.equal((await admin.getPublication(p.id))?.scheduled_at, null);
  await admin.savePublication(
    draft({ id: p.id, status: "published", scheduled_at: null }),
  );
  assert.equal((await member.getPublication(p.id))?.status, "published");
  await admin.archivePublication(p.id);
  assert.equal(await member.getPublication(p.id), null);
  assert.equal(
    (await createDemoRepository("admin", storage).getPublication(p.id))?.status,
    "archived",
  );
});

test("um dia não recebe dois devocionais principais publicados ou agendados", async () => {
  const admin = createDemoRepository("admin", memory());
  await admin.savePublication(
    draft({
      type: "devotional",
      reference_date: "2099-12-01",
      status: "scheduled",
      scheduled_at: "2099-12-01T10:00:00Z",
    }),
  );
  await assert.rejects(
    admin.savePublication(
      draft({
        type: "devotional",
        reference_date: "2099-12-01",
        status: "published",
      }),
    ),
    /Já há/,
  );
  await assert.doesNotReject(
    admin.savePublication(
      draft({
        type: "devotional",
        reference_date: "2099-12-01",
        status: "draft",
      }),
    ),
  );
});

test("favoritos, conclusões e etapas persistem e toggles repetidos não duplicam", async () => {
  const storage = memory();
  const member = createDemoRepository("member", storage);
  await member.setFavorite("demo-training", true);
  await member.setFavorite("demo-training", true);
  await member.setCompletion("demo-training", true);
  await member.setChallengeStep("demo-step-1", true);
  const reopened = createDemoRepository("member", storage);
  assert.deepEqual(await reopened.getActivity(), {
    favoriteIds: ["demo-training"],
    completionIds: ["demo-training"],
    eventIds: [],
    stepIds: ["demo-step-1"],
  });
  await reopened.setFavorite("demo-training", false);
  await reopened.setCompletion("demo-training", false);
  await reopened.setChallengeStep("demo-step-1", false);
  assert.deepEqual(await member.getActivity(), {
    favoriteIds: [],
    completionIds: [],
    eventIds: [],
    stepIds: [],
  });
});

test("inscrição de exemplo persiste, é idempotente e pode ser cancelada", async () => {
  const storage = memory();
  const member = createDemoRepository("member", storage);
  await member.registerEvent("demo-event");
  await member.registerEvent("demo-event");
  assert.deepEqual(
    (await createDemoRepository("member", storage).getActivity()).eventIds,
    ["demo-event"],
  );
  await member.cancelRegistration("demo-event");
  assert.deepEqual((await member.getActivity()).eventIds, []);
});

test("armazenamentos distintos não compartilham dados e estado corrompido recupera a prévia", async () => {
  const first = memory();
  const member = createDemoRepository("member", first);
  await member.setFavorite("demo-training", true);
  assert.deepEqual(
    (await createDemoRepository("member", memory()).getActivity()).favoriteIds,
    [],
  );
  await first.setItem("eleva:demo:v1", "{quebrado");
  assert.deepEqual(
    (await createDemoRepository("member", first).getActivity()).favoriteIds,
    [],
  );
  assert.ok(
    (await createDemoRepository("member", first).listPublications()).length > 0,
  );
});

test("Marina e Rebeca têm identidades e permissões próprias", async () => {
  const storage = memory();
  const marina = createDemoRepository("marina", storage);
  const rebeca = createDemoRepository("rebeca", storage);
  assert.equal((await marina.getProfile())?.id, "demo-marina");
  assert.equal((await marina.getProfile())?.full_name, "Marina");
  assert.equal((await rebeca.getProfile())?.id, "demo-rebeca");
  assert.equal((await rebeca.getProfile())?.full_name, "Rebeca");
  assert.equal((await marina.getAccess())?.role, "member");
  assert.equal((await rebeca.getAccess())?.role, "admin");
  await assert.rejects(marina.savePublication(draft()), /exclusiva/);
  const publication = await rebeca.savePublication(
    draft({ status: "published" }),
  );
  assert.equal(
    (await marina.getPublication(publication.id))?.title,
    "Teste editorial",
  );
});

test("atividades de Marina e Rebeca ficam separadas, inclusive ao reabrir", async () => {
  const storage = memory();
  const marina = createDemoRepository("marina", storage);
  const rebeca = createDemoRepository("rebeca", storage);
  await marina.setFavorite("demo-training", true);
  await marina.setCompletion("demo-training", true);
  await marina.setChallengeStep("demo-step-1", true);
  await marina.registerEvent("demo-event");
  assert.deepEqual((await rebeca.getActivity()).favoriteIds, []);
  assert.deepEqual((await rebeca.getActivity()).completionIds, []);
  assert.deepEqual((await rebeca.getActivity()).stepIds, []);
  assert.deepEqual((await rebeca.getActivity()).eventIds, []);
  await rebeca.setFavorite("demo-devotional", true);
  assert.deepEqual(
    (await createDemoRepository("marina", storage).getActivity()).favoriteIds,
    ["demo-training"],
  );
  assert.deepEqual(
    (await createDemoRepository("rebeca", storage).getActivity()).favoriteIds,
    ["demo-devotional"],
  );
});

test("sem conta escolhida a prévia não concede identidade, acesso ou operações", async () => {
  const guest = createDemoRepository(null, memory());
  assert.equal(await guest.getProfile(), null);
  assert.equal(await guest.getAccess(), null);
  await assert.rejects(guest.listPublications(), /Escolha uma conta/);
  await assert.rejects(
    guest.setFavorite("demo-training", true),
    /Escolha uma conta/,
  );
  await assert.rejects(guest.savePublication(draft()), /Escolha uma conta/);
});

test("a atividade antiga migra para Marina sem atribuí-la à Rebeca", async () => {
  const storage = memory();
  const seed = await createDemoRepository("marina", storage).listPublications();
  await storage.setItem(
    "eleva:demo:v1",
    JSON.stringify({
      publications: seed,
      activity: {
        favoriteIds: ["demo-training"],
        completionIds: [],
        eventIds: [],
        stepIds: [],
      },
    }),
  );
  assert.deepEqual(
    (await createDemoRepository("marina", storage).getActivity()).favoriteIds,
    ["demo-training"],
  );
  assert.deepEqual(
    (await createDemoRepository("rebeca", storage).getActivity()).favoriteIds,
    [],
  );
});

test("a conta escolhida restaura a sessão e sair remove a seleção", async () => {
  const { readDemoSession, saveDemoSession } =
    await import("../src/services/demoRepository");
  const storage = memory();
  assert.equal(await readDemoSession(storage), null);
  await saveDemoSession("rebeca", storage);
  assert.equal(await readDemoSession(storage), "rebeca");
  await saveDemoSession("marina", storage);
  assert.equal(await readDemoSession(storage), "marina");
  await saveDemoSession(null, storage);
  assert.equal(await readDemoSession(storage), null);
  await storage.setItem("eleva:demo-session:v1", "admin");
  assert.equal(await readDemoSession(storage), null);
});
