import type { Publication } from "../types/domain";

export function editorialDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dailyDevotional(
  publications: Publication[],
  date = new Date(),
) {
  const day = editorialDay(date);
  return publications.find(
    (item) =>
      item.type === "devotional" &&
      item.status === "published" &&
      item.reference_date === day,
  );
}
