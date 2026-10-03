/** Clamp `value` into [min, max] (min wins if the range is inverted). */
export function clampProgress(value: number, min: number, max: number): number {
  const hi = Math.max(min, max);
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), hi);
}
