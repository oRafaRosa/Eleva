import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCredentials,
  validateNewPassword,
} from "../src/services/authValidation";
import { verifyMember } from "../src/services/memberLoading";
test("cadastro valida e-mail, senha e confirmação sem alterar senha", () => {
  assert.equal(validateCredentials("  A@Example.com "), "a@example.com");
  assert.throws(() => validateCredentials("a@"));
  assert.throws(() => validateCredentials("a@example.com", ""));
  assert.throws(() => validateNewPassword("curta", "curta"));
  assert.throws(() => validateNewPassword("longa-com-123", "outra"));
  assert.doesNotThrow(() =>
    validateNewPassword("longa-com-123", "longa-com-123"),
  );
});
test("FREE e banida mantêm identidade para a página de plano sem virar PRO", async () => {
  for (const banned of [false, true]) {
    const result = await verifyMember({
      readIdentity: async () => "one",
      getAccess: async () => ({
        role: "member",
        active: false,
        plan: "free",
        banned,
      }),
      getProfile: async () => ({
        id: "one",
        full_name: "Nome",
        avatar_path: null,
      }),
      onSubject: () => {},
      assertCurrent: () => {},
    });
    assert.equal(result.plan, "free");
    assert.equal(result.banned, banned);
  }
});
import { createChunkedStorage } from "../src/services/chunkedStorage";
test("armazenamento nativo preserva sessão em falha de escrita e remove seus fragmentos", async () => {
  const data = new Map<string, string>();
  let fail = false;
  const secure = {
    getItemAsync: async (k: string) => data.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => {
      if (fail && k.includes(".")) throw new Error("interrompido");
      assert.ok(Buffer.byteLength(v) <= 2000);
      data.set(k, v);
    },
    deleteItemAsync: async (k: string) => {
      data.delete(k);
    },
  };
  const storage = createChunkedStorage(secure);
  const token = "x".repeat(2501) + "🌸".repeat(500);
  await storage.setItem("session", token);
  assert.equal(await storage.getItem("session"), token);
  fail = true;
  await assert.rejects(storage.setItem("session", "nova sessão"));
  assert.equal(await storage.getItem("session"), token);
  fail = false;
  await storage.setItem("session", "renovada");
  assert.equal(await storage.getItem("session"), "renovada");
  await storage.removeItem("session");
  assert.equal(await storage.getItem("session"), null);
  assert.equal(data.size, 0);
});
