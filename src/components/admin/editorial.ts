import type {
  PublicationDraft,
  PublicationType,
  PublicationStatus,
  Pillar,
} from "../../types/domain";

export const typeLabels: Record<PublicationType, string> = {
  devotional: "Devocional",
  training: "Treino",
  lesson: "Aula",
  motivation: "Mensagem",
  material: "Material",
  podcast: "Podcast",
  post: "Publicação livre",
};
export const statusLabels: Record<PublicationStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
};
export const pillarLabels: Record<Pillar, string> = {
  body: "Corpo",
  mind: "Mente",
  spirit: "Espírito",
};
export function localDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (key: string) => parts.find((p) => p.type === key)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
// Offset is derived from the IANA timezone, including historical DST rules.
export function scheduledInstant(day: string, time: string): string {
  if (!validDate(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Confira a data (AAAA-MM-DD) e o horário (HH:MM).");
  const nominal = Date.parse(`${day}T${time}:00Z`);
  let instant = nominal;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const get = (key: string) => parts.find((p) => p.type === key)?.value;
    const observed = Date.parse(
      `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`,
    );
    const delta = nominal - observed;
    instant += delta;
    if (delta === 0) return new Date(instant).toISOString();
  }
  throw new Error(
    "Esse horário não existe no fuso de São Paulo. Escolha outro horário.",
  );
}
export function scheduleFields(iso: string | null) {
  if (!iso) return { day: localDate(), time: "07:00" };
  const date = new Date(iso);
  return {
    day: localDate(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date),
  };
}
export function displayTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
export function validateDraft(draft: PublicationDraft): void {
  if (!draft.title.trim()) throw new Error("Preencha o título.");
  if (!draft.body.trim())
    throw new Error("Escreva o conteúdo antes de salvar.");
  if (draft.type === "devotional" && !validDate(draft.reference_date || ""))
    throw new Error("Informe uma data válida para o devocional.");
  if (
    draft.status === "scheduled" &&
    (!draft.scheduled_at ||
      !Number.isFinite(Date.parse(draft.scheduled_at)) ||
      Date.parse(draft.scheduled_at) <= Date.now())
  )
    throw new Error("Escolha uma data e um horário futuros para agendar.");
  if (draft.media_url && !/^https:\/\//i.test(draft.media_url))
    throw new Error("O link da mídia precisa começar com https://.");
  if (draft.type === "training") {
    const duration = draft.details?.duration_minutes;
    if (
      duration !== undefined &&
      (!Number.isFinite(Number(duration)) || Number(duration) <= 0)
    )
      throw new Error("Informe uma duração maior que zero.");
  }
}
