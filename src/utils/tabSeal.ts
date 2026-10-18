export function sealCenter(
  width: number,
  index: number,
  count: number,
): number {
  if (!Number.isFinite(width) || width <= 0 || count <= 0) return 0;
  const safeIndex = Math.min(Math.max(0, index), count - 1);
  return (width / count) * (safeIndex + 0.5);
}

export function sealDuration(distance: number, reduced: boolean): number {
  if (reduced) return 0;
  return Math.min(320, Math.max(180, 180 + Math.abs(distance) * 0.35));
}
