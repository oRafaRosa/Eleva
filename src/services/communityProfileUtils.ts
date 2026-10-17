import type { ForumTopic } from "../types/forum";

export function whatsappUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  // Local Brazilian numbers have DDD + 8/9 digits; international numbers use +DDI.
  if (
    !phone.trim().startsWith("+") &&
    (digits.length === 10 || digits.length === 11)
  )
    digits = "55" + digits;
  return "https://wa.me/" + digits;
}
export function topCommunityPosts(topics: ForumTopic[]): ForumTopic[] {
  return topics
    .filter((t) => !t.deleted)
    .sort(
      (a, b) =>
        (b.like_count ?? 0) +
          (b.comment_count ?? 0) -
          ((a.like_count ?? 0) + (a.comment_count ?? 0)) ||
        b.created_at.localeCompare(a.created_at) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 6);
}
export function clubTenure(joinedAt: string, now = new Date()): string {
  const joined = new Date(joinedAt);
  if (!Number.isFinite(joined.getTime())) return "";
  const day = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const days = Math.max(
    0,
    Math.round((Date.parse(day(now)) - Date.parse(day(joined))) / 86400000),
  );
  if (days === 0) return "No clube desde hoje";
  if (days === 1) return "1 dia de clube";
  if (days < 30) return days + " dias de clube";
  const months = Math.max(1, Math.floor(days / 30.4375));
  if (months < 12)
    return months + (months === 1 ? " mês de clube" : " meses de clube");
  const years = Math.floor(months / 12);
  return years + (years === 1 ? " ano de clube" : " anos de clube");
}
