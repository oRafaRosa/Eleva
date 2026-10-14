import test from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createDemoRepository } from "../src/services/demoRepository";
import { createSupabaseRepository } from "../src/services/supabaseRepository";
import { decodeCover, MAX_COVER_BYTES } from "../src/services/coverValidation";
const upload = { base64: "/9j/AAH/2Q==", mimeType: "image/jpeg" as const };
const draft = {
  title: "Uma leitura",
  summary: "Resumo",
  body: "Conteúdo",
  type: "post" as const,
  pillar: "mind" as const,
  status: "published" as const,
  cover_upload: upload,
};
const storage = () => {
  const m = new Map<string, string>();
  return {
    getItem: async (k: string) => m.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      m.set(k, v);
    },
  };
};
test("capa local persiste sem guardar campo transitório e integrante não faz upload", async () => {
  const s = storage(),
    admin = createDemoRepository("rebeca", s),
    member = createDemoRepository("marina", s);
  await assert.rejects(member.savePublication(draft));
  const item = await admin.savePublication(draft);
  assert.equal(item.cover_path, `data:image/jpeg;base64,${upload.base64}`);
  assert.ok(!("cover_upload" in item));
  assert.equal(
    (await createDemoRepository("marina", s).getPublication(item.id))
      ?.cover_path,
    item.cover_path,
  );
});
test("capa rejeita dados ativos, assinatura errada e payload acima de 1 MB", () => {
  assert.ok(decodeCover(upload).length);
  assert.throws(() =>
    decodeCover({ ...upload, base64: btoa("<svg><script/></svg>") }),
  );
  assert.throws(() =>
    decodeCover({
      ...upload,
      base64: "a".repeat(Math.ceil(MAX_COVER_BYTES / 3) * 4 + 4),
    }),
  );
});
function mocked(options: { dbError?: boolean; uploadError?: boolean } = {}) {
  const events: string[] = [],
    payloads: Record<string, unknown>[] = [];
  const oldCover = "existing/cover-old.jpg";
  const single = async () => {
    events.push("save");
    return options.dbError
      ? { data: null, error: new Error("save failed") }
      : { data: { ...draft, id: "created" }, error: null };
  };
  const query = {
    select: () => ({ single }),
    eq: () => ({ select: () => ({ single }) }),
  };
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: "admin" } }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { cover_path: oldCover }, error: null }),
        }),
      }),
      insert: (fields: Record<string, unknown>) => {
        payloads.push(fields);
        return query;
      },
      update: (fields: Record<string, unknown>) => {
        payloads.push(fields);
        return query;
      },
    }),
    storage: {
      from: () => ({
        upload: async (path: string) => {
          events.push(`upload:${path}`);
          return {
            error: options.uploadError ? new Error("upload failed") : null,
          };
        },
        remove: async (paths: string[]) => {
          events.push(`remove:${paths[0]}`);
          return { error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;
  let n = 0;
  return {
    events,
    payloads,
    repo: createSupabaseRepository(client, {
      randomUUID: () => (n++ === 0 ? "created" : "asset"),
    }),
  };
}
test("upload privado precede insert publicado, UUID coincide e campo transitório não vai ao banco", async () => {
  const { repo, events, payloads } = mocked();
  await repo.savePublication(draft);
  assert.deepEqual(events, ["upload:created/cover-asset.jpg", "save"]);
  assert.equal(payloads[0].id, "created");
  assert.equal(payloads[0].cover_path, "created/cover-asset.jpg");
  assert.ok(!("cover_upload" in payloads[0]));
});
test("falha ao gravar remove novo objeto e falha no upload não grava publicação", async () => {
  const fail = mocked({ dbError: true });
  await assert.rejects(fail.repo.savePublication(draft));
  assert.deepEqual(fail.events, [
    "upload:created/cover-asset.jpg",
    "save",
    "remove:created/cover-asset.jpg",
  ]);
  const denied = mocked({ uploadError: true });
  await assert.rejects(denied.repo.savePublication(draft));
  assert.equal(denied.payloads.length, 0);
});
test("troca remove capa anterior só após gravar a nova", async () => {
  const { repo, events } = mocked();
  await repo.savePublication({ ...draft, id: "existing" });
  assert.deepEqual(events, [
    "upload:existing/cover-created.jpg",
    "save",
    "remove:existing/cover-old.jpg",
  ]);
});

test("remoção da capa apaga arquivo depois do commit e mantém original se gravação falha", async () => {
  const { cover_upload, ...withoutUpload } = draft;
  const success = mocked();
  await success.repo.savePublication({
    ...withoutUpload,
    id: "existing",
    cover_path: null,
  });
  assert.deepEqual(success.events, ["save", "remove:existing/cover-old.jpg"]);
  assert.equal(success.payloads[0].cover_path, null);
  const failure = mocked({ dbError: true });
  await assert.rejects(
    failure.repo.savePublication({
      ...withoutUpload,
      id: "existing",
      cover_path: null,
    }),
  );
  assert.deepEqual(failure.events, ["save"]);
});
