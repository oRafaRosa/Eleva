import type { ChallengeDraft } from "../types/domain";
const hosts = new Set(["gymrats.app", "www.gymrats.app", "share.gymrats.app"]);
export function gymratsUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Cole um link válido do GymRats.");
  }
  if (
    url.protocol !== "https:" ||
    !hosts.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    /\s/.test(value) ||
    value.length > 2048
  )
    throw new Error(
      "Use um link HTTPS do GymRats, sem login ou senha no endereço.",
    );
  return url.toString();
}
function date(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function validateChallengeDraft(draft: ChallengeDraft): ChallengeDraft {
  const title = draft.title.trim(),
    description = draft.description.trim();
  if (!title || title.length > 120)
    throw new Error("Preencha um título com até 120 caracteres.");
  if (!description || description.length > 3000)
    throw new Error("Preencha uma descrição com até 3000 caracteres.");
  if (
    !date(draft.starts_on) ||
    !date(draft.ends_on) ||
    draft.ends_on < draft.starts_on
  )
    throw new Error(
      "Confira as datas. O encerramento precisa ser igual ou posterior ao início.",
    );
  if (!["draft", "published", "archived"].includes(draft.status))
    throw new Error("Escolha um estado válido para o desafio.");
  return {
    ...draft,
    title,
    description,
    gymrats_url: gymratsUrl(draft.gymrats_url),
  };
}
