import type {
  ElevaEvent,
  Pillar,
  Publication,
  PublicationType,
} from "../types/domain";

export function continuablePublications(
  publications: Publication[],
  favorites: string[],
  completions: string[],
  limit = 2,
): Publication[] {
  const saved = new Set(favorites);
  const finished = new Set(completions);
  return publications
    .filter((item) => saved.has(item.id) && !finished.has(item.id))
    .slice(0, Math.max(0, limit));
}

export function availableCompletions(
  publications: Publication[],
  completions: string[],
): Publication[] {
  const finished = new Set(completions);
  return publications.filter((item) => finished.has(item.id));
}

function searchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function filterPublications(
  publications: Publication[],
  query: string,
  pillar: Pillar | "all",
  format: PublicationType | "all",
): Publication[] {
  const term = searchText(query.trim());
  return publications.filter(
    (item) =>
      (pillar === "all" || item.pillar === pillar) &&
      (format === "all" || item.type === format) &&
      (!term || searchText(`${item.title} ${item.summary}`).includes(term)),
  );
}

export function splitUpcomingEvents(
  events: ElevaEvent[],
  registrations: string[],
  now: Date,
): { registered: ElevaEvent[]; others: ElevaEvent[] } {
  const confirmed = new Set(registrations);
  const future = events
    .filter(
      (event) =>
        event.status === "published" &&
        Number.isFinite(Date.parse(event.starts_at)) &&
        Date.parse(event.starts_at) > now.getTime(),
    )
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  return {
    registered: future.filter((event) => confirmed.has(event.id)),
    others: future.filter((event) => !confirmed.has(event.id)),
  };
}
