/**
 * Framework-agnostic slider value math, shared by every adapter.
 */

export interface SliderRange {
  min: number;
  max: number;
  /** Must be > 0. */
  step: number;
}

export type SliderOrientation = "horizontal" | "vertical";

/** Number of decimals in `n`, so step arithmetic doesn't drift (0.1 + 0.2). */
function decimals(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa = "", exponent] = String(n).toLowerCase().split("e");
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent ?? 0));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds to the nearest step from `min`, then clamps (the last step may be partial). */
export function snapToStep(value: number, { min, max, step }: SliderRange): number {
  if (!(step > 0)) return clamp(value, min, max);
  const snapped = Math.round((value - min) / step) * step + min;
  const precision = Math.max(decimals(step), decimals(min));
  const rounded = Number(snapped.toFixed(precision));
  // Snapping above max may land past it; fall back to the last reachable step or max
  return clamp(rounded, min, max);
}

/** Position of `value` in [min, max] as 0-100. */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((clamp(value, min, max) - min) / (max - min)) * 100;
}

/** Value at a 0-1 fraction of the track, snapped to the step. */
export function fractionToValue(fraction: number, range: SliderRange): number {
  const f = clamp(fraction, 0, 1);
  return snapToStep(range.min + f * (range.max - range.min), range);
}

/**
 * Fraction (0-1) of the track under a pointer. Horizontal tracks grow to the
 * right; vertical tracks grow upward.
 */
export function pointerFraction(
  point: { x: number; y: number },
  rect: { left: number; top: number; width: number; height: number },
  orientation: SliderOrientation = "horizontal",
): number {
  if (orientation === "vertical") {
    return rect.height > 0 ? clamp((rect.top + rect.height - point.y) / rect.height, 0, 1) : 0;
  }
  return rect.width > 0 ? clamp((point.x - rect.left) / rect.width, 0, 1) : 0;
}

export const SLIDER_KEYS = [
  "ArrowRight",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
] as const;

/**
 * The value a key moves the slider to, or `null` when the key isn't a slider
 * key. Arrows move one step, PageUp/PageDown `largeStep` (default 10 steps),
 * Home/End jump to min/max (WAI-ARIA APG slider).
 */
export function keyboardValue(
  key: string,
  value: number,
  range: SliderRange & { largeStep?: number },
): number | null {
  const { min, max, step } = range;
  const large = range.largeStep ?? step * 10;
  let next: number;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      next = value + step;
      break;
    case "ArrowLeft":
    case "ArrowDown":
      next = value - step;
      break;
    case "PageUp":
      next = value + large;
      break;
    case "PageDown":
      next = value - large;
      break;
    case "Home":
      return min;
    case "End":
      return max;
    default:
      return null;
  }
  return snapToStep(next, range);
}
