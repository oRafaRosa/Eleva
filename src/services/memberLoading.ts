import type { Profile } from "../types/domain";
import type { Access, ElevaRepository } from "./repository";
export type MemberUser = Profile & { role: "member" | "admin" };
export type AuthStatus =
  | "checking"
  | "verified"
  | "unknown"
  | "signed_out"
  | "denied";
export class SessionGateError extends Error {
  constructor(
    public reason: "signed_out" | "denied",
    message: string,
  ) {
    super(message);
    this.name = "SessionGateError";
  }
}
export class StaleSessionError extends Error {
  constructor() {
    super("A atualização foi interrompida. Tente novamente.");
    this.name = "StaleSessionError";
  }
}
export class SavedRefreshError extends Error {
  readonly saved = true;
  constructor(public original: unknown) {
    super(
      "A alteração foi salva, mas não foi possível atualizar a tela. Tente atualizar novamente.",
    );
    this.name = "SavedRefreshError";
  }
}
export function invalidAuthSession(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; code?: string; status?: number };
  if (e.name === "AuthRetryableFetchError") return false;
  return (
    e.name === "AuthSessionMissingError" ||
    [
      "PGRST301",
      "PGRST303",
      "bad_jwt",
      "session_not_found",
      "refresh_token_not_found",
      "refresh_token_already_used",
      "user_not_found",
      "user_banned",
    ].includes(e.code ?? "") ||
    (e.name === "AuthApiError" && (e.status === 401 || e.status === 403))
  );
}
export async function verifyMember(request: {
  readIdentity: () => Promise<string | null>;
  getAccess: () => Promise<Access | null>;
  getProfile: () => Promise<Profile | null>;
  assertCurrent: () => void;
  onSubject: (id: string) => void;
  onAccess?: (access: Access, id: string) => void;
}): Promise<MemberUser> {
  let id: string | null;
  try {
    id = await request.readIdentity();
  } catch (error) {
    request.assertCurrent();
    if (invalidAuthSession(error))
      throw new SessionGateError(
        "signed_out",
        "Sua sessão terminou. Entre novamente.",
      );
    throw error;
  }
  request.assertCurrent();
  if (!id)
    throw new SessionGateError(
      "signed_out",
      "Entre na sua conta para continuar.",
    );
  request.onSubject(id);
  const access = await request.getAccess();
  request.assertCurrent();
  if (!access?.active)
    throw new SessionGateError(
      "denied",
      "Seu acesso ainda não está ativo. Fale com a equipe ELEVA.",
    );
  request.onAccess?.(access, id);
  const profile = await request.getProfile();
  request.assertCurrent();
  if (!profile || profile.id !== id)
    throw new Error("Não foi possível carregar seu perfil. Tente novamente.");
  return { ...profile, role: access.role };
}
export async function loadMemberContent(repo: ElevaRepository) {
  const [publications, events, challenges, activity] = await Promise.all([
    repo.listPublications(),
    repo.listEvents(),
    repo.listChallenges(),
    repo.getActivity(),
  ]);
  const publishedChallenges = challenges.filter(
    (c) => c.status === "published",
  );
  const challengeSteps = (
    await Promise.all(
      publishedChallenges.map((c) => repo.listChallengeSteps(c.id)),
    )
  ).flat();
  return {
    publications: publications.filter((p) => p.status === "published"),
    events: events.filter((e) => e.status === "published"),
    challenges: publishedChallenges,
    challengeSteps,
    activity,
  };
}
export async function saveThenRefresh(
  work: () => Promise<void>,
  refresh: () => Promise<void>,
) {
  await work();
  try {
    await refresh();
  } catch (error) {
    if (error instanceof StaleSessionError) throw error;
    throw new SavedRefreshError(error);
  }
}
export function refreshFailureDisposition(
  error: unknown,
  user: MemberUser | null,
  subject: string | null,
) {
  if (error instanceof SessionGateError)
    return { clear: true, status: error.reason } as const;
  if (invalidAuthSession(error))
    return { clear: true, status: "signed_out" } as const;
  if (user && user.id === subject)
    return { clear: false, status: "verified" } as const;
  return { clear: true, status: "unknown" } as const;
}
export function authEventDecision(
  event: string,
  nextId: string | null,
  currentId: string | null,
) {
  if (event === "SIGNED_OUT")
    return { clear: true, revalidate: false, signedOut: true };
  return {
    clear: Boolean(nextId && nextId !== currentId),
    revalidate: true,
    signedOut: false,
  };
}
