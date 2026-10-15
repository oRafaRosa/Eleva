import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyMember,
  invalidAuthSession,
  refreshFailureDisposition,
  authEventDecision,
  loadMemberContent,
  saveThenRefresh,
  SessionGateError,
  StaleSessionError,
  SavedRefreshError,
} from "../src/services/memberLoading";
import type { ElevaRepository } from "../src/services/repository";
const profile = { id: "marina", full_name: "Marina", avatar_path: null };
const known = { ...profile, role: "member" as const };
const network = Object.assign(new Error("Falha de rede"), {
  name: "AuthRetryableFetchError",
  status: 503,
});
const base = () => ({
  readIdentity: async () => profile.id,
  getAccess: async () => ({ role: "member" as const, active: true }),
  getProfile: async () => profile,
  assertCurrent: () => {},
  onSubject: (_id: string) => {},
});
test("erro de rede preserva somente cache da conta previamente verificada", async () => {
  await assert.rejects(
    verifyMember({
      ...base(),
      readIdentity: async () => {
        throw network;
      },
    }),
    (error) => error === network,
  );
  assert.deepEqual(refreshFailureDisposition(network, known, "marina"), {
    clear: false,
    status: "verified",
  });
  assert.deepEqual(refreshFailureDisposition(network, known, "rebeca"), {
    clear: true,
    status: "unknown",
  });
  assert.deepEqual(refreshFailureDisposition(network, null, null), {
    clear: true,
    status: "unknown",
  });
  assert.equal(invalidAuthSession(network), false);
});
test("sessão inválida e acesso revogado apagam privados, sem consultar conteúdo", async () => {
  for (const error of [
    { name: "AuthSessionMissingError" },
    { name: "AuthApiError", status: 401, code: "bad_jwt" },
    { code: "session_not_found" },
  ]) {
    await assert.rejects(
      verifyMember({
        ...base(),
        readIdentity: async () => {
          throw error;
        },
      }),
      (e) => e instanceof SessionGateError && e.reason === "signed_out",
    );
  }
  await assert.rejects(
    verifyMember({ ...base(), getAccess: async () => null }),
    (e) => e instanceof SessionGateError && e.reason === "denied",
  );
  assert.deepEqual(
    refreshFailureDisposition(
      new SessionGateError("denied", "Acesso revogado"),
      known,
      "marina",
    ),
    { clear: true, status: "denied" },
  );
});
test("identidade e acesso precedem perfil, e rebaixamento de papel ocorre antes de perfil indisponível", async () => {
  const order: string[] = [];
  await assert.rejects(
    verifyMember({
      ...base(),
      readIdentity: async () => {
        order.push("identity");
        return "marina";
      },
      onSubject: () => {
        order.push("subject");
      },
      getAccess: async () => {
        order.push("access");
        return { role: "member", active: true };
      },
      onAccess: (access) => {
        order.push(`role:${access.role}`);
      },
      getProfile: async () => {
        order.push("profile");
        throw network;
      },
    }),
  );
  assert.deepEqual(order, [
    "identity",
    "subject",
    "access",
    "role:member",
    "profile",
  ]);
  await assert.rejects(
    verifyMember({
      ...base(),
      getProfile: async () => ({ ...profile, id: "rebeca" }),
    }),
    /perfil/,
  );
});
test("troca de conta aborta resultado de carregamento pendente", async () => {
  let epoch = 0;
  const expected = epoch;
  await assert.rejects(
    verifyMember({
      ...base(),
      getAccess: async () => {
        epoch++;
        return { role: "member", active: true };
      },
      assertCurrent: () => {
        if (epoch !== expected) throw new StaleSessionError();
      },
    }),
    StaleSessionError,
  );
});
test("refresh de token da mesma conta revalida sem limpar cache; signout e conta distinta limpam", () => {
  assert.deepEqual(authEventDecision("TOKEN_REFRESHED", "marina", "marina"), {
    clear: false,
    revalidate: true,
    signedOut: false,
  });
  assert.equal(authEventDecision("SIGNED_IN", "marina", "marina").clear, false);
  assert.equal(authEventDecision("SIGNED_IN", "rebeca", "marina").clear, true);
  assert.deepEqual(authEventDecision("SIGNED_OUT", null, "marina"), {
    clear: true,
    revalidate: false,
    signedOut: true,
  });
});
test("falha de conteúdo não produz snapshot parcial", async () => {
  const previous = ["publicação em cache"];
  const repo = {
    listPublications: async () => [],
    listEvents: async () => {
      throw network;
    },
    listChallenges: async () => [],
    getActivity: async () => ({
      favoriteIds: [],
      completionIds: [],
      eventIds: [],
      stepIds: [],
    }),
    listChallengeSteps: async () => [],
  } as unknown as ElevaRepository;
  await assert.rejects(loadMemberContent(repo));
  assert.deepEqual(previous, ["publicação em cache"]);
});
test("ação distingue falha ao gravar de alteração salva com refresh indisponível", async () => {
  const calls: string[] = [];
  await assert.rejects(
    saveThenRefresh(
      async () => {
        calls.push("saved");
      },
      async () => {
        calls.push("refresh");
        throw network;
      },
    ),
    (error) =>
      error instanceof SavedRefreshError &&
      error.saved &&
      error.original === network,
  );
  assert.deepEqual(calls, ["saved", "refresh"]);
  calls.length = 0;
  await assert.rejects(
    saveThenRefresh(
      async () => {
        throw network;
      },
      async () => {
        calls.push("refresh");
      },
    ),
    (error) => error === network,
  );
  assert.deepEqual(calls, []);
  await assert.rejects(
    saveThenRefresh(
      async () => {},
      async () => {
        throw new StaleSessionError();
      },
    ),
    StaleSessionError,
  );
});
