import type { Publication } from "../types/domain";
export type PublicationContent = Pick<
  Publication,
  "type" | "body" | "summary" | "details"
>;
export interface DetailSection {
  key: string;
  label: string;
  paragraphs: string[];
}
const labels: Record<string, string> = {
  verse: "Versículo",
  application: "Para hoje",
  prayer: "Oração",
  objective: "Objetivo",
  exercises: "Exercícios",
  instructions: "Orientações",
  professional: "Profissional responsável",
  author: "Autoria",
  duration_minutes: "Duração",
  level: "Nível",
  equipment: "Equipamentos",
  description: "Descrição",
  name: "Nome",
  sets: "Séries",
  reps: "Repetições",
  rest: "Descanso",
  rest_seconds: "Descanso em segundos",
  duration_seconds: "Duração em segundos",
  duration: "Duração",
  url: "Link",
  title: "Título",
  notes: "Observações",
};
export function readableValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value))
    return value.map(readableValue).filter(Boolean).join("\n");
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => {
        const text = readableValue(item);
        return text ? `${labels[key] ?? key.replace(/_/g, " ")}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  return "";
}
export function publicationContent(item: PublicationContent) {
  const details = item.details ?? {};
  const metadata = ["duration_minutes", "level", "equipment"]
    .map((key) => {
      const text = readableValue(details[key]);
      return text
        ? {
            key,
            label: labels[key],
            value: key === "duration_minutes" ? `${text} min` : text,
          }
        : null;
    })
    .filter((value): value is { key: string; label: string; value: string } =>
      Boolean(value),
    );
  const order = [
    "verse",
    "objective",
    "application",
    "prayer",
    "exercises",
    "instructions",
    "professional",
    "author",
  ];
  const skipped = new Set(metadata.map((m) => m.key));
  const keys = [
    ...order.filter((key) => key in details),
    ...Object.keys(details).filter((key) => !order.includes(key)),
  ];
  const sections: DetailSection[] = keys
    .filter((key) => !skipped.has(key))
    .map((key) => {
      const value = details[key];
      const paragraphs = Array.isArray(value)
        ? value.map(readableValue).filter(Boolean)
        : readableValue(value)
            .split(/\n\s*\n/)
            .filter(Boolean);
      return { key, label: labels[key] ?? key.replace(/_/g, " "), paragraphs };
    })
    .filter((section) => section.paragraphs.length > 0);
  return {
    metadata,
    sections,
    paragraphs: item.body
      .trim()
      .split(/\n\s*\n/)
      .filter(Boolean),
  };
}
