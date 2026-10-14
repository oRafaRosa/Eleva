import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRepository } from "../src/services/demoRepository";
import {
  validateProfileUpdate,
  decodeAvatar,
  MAX_AVATAR_BYTES,
} from "../src/services/profileValidation";
const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
  };
};
const jpeg = btoa(String.fromCharCode(255, 216, 255, 217));
test("perfil persiste por conta sem alterar identidade ou papel", async () => {
  const storage = memory();
  const marina = createDemoRepository("marina", storage);
  const rebeca = createDemoRepository("rebeca", storage);
  await marina.updateProfile({
    full_name: "  Marina Silva  ",
    phone: "(11) 99999-1234",
    city: "São Paulo",
    avatar_base64: jpeg,
    id: "demo-rebeca",
    role: "admin",
  } as Parameters<typeof marina.updateProfile>[0]);
  const restored = (await createDemoRepository(
    "marina",
    storage,
  ).getProfile())!;
  assert.equal(restored.full_name, "Marina Silva");
  assert.equal(restored.id, "demo-marina");
  assert.equal((await marina.getAccess())?.role, "member");
  assert.equal(restored.phone, "(11) 99999-1234");
  assert.equal(restored.city, "São Paulo");
  assert.equal(restored.avatar_url, `data:image/jpeg;base64,${jpeg}`);
  assert.equal((await rebeca.getProfile())?.full_name, "Rebeca");
  assert.equal((await rebeca.getProfile())?.avatar_path, null);
});
test("nome, telefone, cidade inválidos não sobrescrevem o perfil salvo", async () => {
  const repository = createDemoRepository("marina", memory());
  await repository.updateProfile({
    full_name: "Marina Silva",
    city: "Cajamar",
  });
  await assert.rejects(repository.updateProfile({ full_name: " " }), /nome/);
  await assert.rejects(
    repository.updateProfile({ full_name: "x".repeat(121) }),
    /nome/,
  );
  await assert.rejects(
    repository.updateProfile({
      full_name: "Marina",
      phone: "http://example.com",
    }),
    /telefone/,
  );
  await assert.rejects(
    repository.updateProfile({ full_name: "Marina", city: "x".repeat(101) }),
    /cidade/,
  );
  assert.equal((await repository.getProfile())?.full_name, "Marina Silva");
  assert.equal((await repository.getProfile())?.city, "Cajamar");
});
test("foto fica ao editar outros campos e pode ser removida sem afetar a outra conta", async () => {
  const storage = memory();
  const marina = createDemoRepository("marina", storage);
  const rebeca = createDemoRepository("rebeca", storage);
  await marina.updateProfile({ full_name: "Marina", avatar_base64: jpeg });
  await rebeca.updateProfile({ full_name: "Rebeca", avatar_base64: jpeg });
  await marina.updateProfile({ full_name: "Marina", city: "São Paulo" });
  assert.ok((await marina.getProfile())?.avatar_path);
  await marina.updateProfile({ full_name: "Marina", avatar_base64: null });
  assert.equal((await marina.getProfile())?.avatar_url, null);
  assert.ok((await rebeca.getProfile())?.avatar_path);
});
test("foto rejeita formato ativo, dados inválidos e payload acima do limite", () => {
  assert.throws(() => decodeAvatar(btoa("<svg onload='alert(1)'/>")), /JPEG/);
  assert.throws(() => decodeAvatar("data:image/jpeg;base64," + jpeg));
  assert.throws(() => decodeAvatar("?"));
  const tooLarge = new Uint8Array(MAX_AVATAR_BYTES + 1);
  tooLarge.set([255, 216, 255]);
  tooLarge[tooLarge.length - 2] = 255;
  tooLarge[tooLarge.length - 1] = 217;
  assert.throws(
    () => decodeAvatar(Buffer.from(tooLarge).toString("base64")),
    /512 KB/,
  );
  assert.deepEqual([...decodeAvatar(jpeg)], [255, 216, 255, 217]);
});
test("visitante não consegue editar perfil e campos externos são descartados", async () => {
  await assert.rejects(
    createDemoRepository(null, memory()).updateProfile({
      full_name: "Visitante",
    }),
    /entrar/,
  );
  assert.deepEqual(
    validateProfileUpdate({
      full_name: "Marina",
      id: "foreign",
      role: "admin",
      avatar_path: "foreign.jpg",
    } as Parameters<typeof validateProfileUpdate>[0]),
    { full_name: "Marina", phone: null, city: null },
  );
});
