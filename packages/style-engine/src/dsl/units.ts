export type Length =
  | { unit: "rem"; value: number }
  | { unit: "px"; value: number }
  | number
  | string;

/**
 * Radius scale steps shared by the DSL surface (`rounded`, `borderRadius`).
 * Single source of truth so the two aliases can never drift apart.
 */
export type RadiusScale = "sm" | "md" | "lg" | "full" | "none";

/**
 * Timing-function aliases accepted by {@link ease}. They map 1:1 to both
 * Tailwind's `ease-*` utilities and CSS `transition-timing-function`.
 */
export type Easing = "linear" | "in" | "out" | "in-out" | (string & {});

export type TransitionProperty =
  | "none"
  | "all"
  | "colors"
  | "opacity"
  | "shadow"
  | "transform"
  | (string & {});

const SCALAR_SPACING_SCALE = 4;

export function rem(value: number): Length {
  return { unit: "rem", value };
}

export function px(value: number): Length {
  return { unit: "px", value };
}

export function lengthToCss(length: Length): string {
  if (typeof length === "string") {
    return length;
  }

  if (typeof length === "number") {
    return `${length * (1 / SCALAR_SPACING_SCALE)}rem`;
  }

  return `${length.value}${length.unit}`;
}

export function lengthToTailwindScale(
  length: Length,
  hint = "spacing",
): number | string {
  if (typeof length === "number") {
    return length;
  }

  if (typeof length === "string") {
    const parsed = Number(length);
    if (!isNaN(parsed)) {
      return parsed;
    }
    if (length.endsWith("rem")) {
      const val = parseFloat(length);
      return val * SCALAR_SPACING_SCALE;
    }
    if (length.endsWith("px")) {
      const val = parseFloat(length);
      return val / 4;
    }
    return `[${length}]`;
  }

  if (
    typeof length === "object" &&
    length !== null &&
    "unit" in length &&
    "value" in length
  ) {
    if (length.unit === "rem") {
      return length.value * SCALAR_SPACING_SCALE;
    }
    if (length.unit === "px") {
      return length.value / 4;
    }
  }

  throw new Error(
    `[prism] Tailwind scale cannot be derived from a typed length for ${hint}. ` +
      `Pass a bare scale number instead, e.g. \`${hint}(4)\`, or use a CSS Modules target.`,
  );
}

/**
 * Normalize a transition-duration value to a bare Tailwind scale step.
 *
 * Accepts:
 * - a bare number (treated as Tailwind's `duration-{n}` step, e.g. `200` → `duration-200`),
 * - a CSS duration string like `"200ms"` / `"2s"` (parsed to ms; CSS Modules
 *   emits the verbatim string and Tailwind falls back to the closest step),
 * - a `rem`/`px` length (rejected — not a duration unit).
 */
export function durationToTailwindScale(
  duration: unknown,
  hint = "duration",
): number {
  if (typeof duration === "number") {
    return duration;
  }
  if (typeof duration === "string") {
    const ms = parseDurationMs(duration);
    if (ms !== null) {
      return roundToDurationStep(ms);
    }
    throw new Error(
      `[prism] ${hint}: cannot parse "${duration}" as a duration. ` +
        `Use a bare number like 200 (Tailwind duration step) or a CSS string like "200ms"/"0.2s".`,
    );
  }
  throw new Error(
    `[prism] ${hint}: unsupported duration value. ` +
      `Use a bare number (Tailwind step) or a CSS duration string.`,
  );
}

export function durationToMs(duration: unknown): string {
  if (typeof duration === "string") {
    return duration;
  }
  if (typeof duration === "number") {
    return `${duration}ms`;
  }
  throw new Error(
    `[prism] duration: unsupported value. Use a number (ms) or a CSS string.`,
  );
}

/** Tailwind's default `duration-*` scale (ms). */
const TAILWIND_DURATION_STEPS = [0, 75, 100, 150, 200, 300, 500, 700, 1000];

function parseDurationMs(value: string): number | null {
  const m = value.trim().match(/^(\d+(?:\.\d+)?)\s*(ms|s)$/);
  if (!m || m[1] === undefined || m[2] === undefined) return null;
  const n = Number(m[1]);
  return m[2] === "s" ? n * 1000 : n;
}

function roundToDurationStep(ms: number): number {
  let best = TAILWIND_DURATION_STEPS[0] ?? 0;
  let bestDiff = Infinity;
  for (const step of TAILWIND_DURATION_STEPS) {
    const diff = Math.abs(step - ms);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = step;
    }
  }
  return best;
}

/** Maps an easing alias to Tailwind's `ease-*` utility name (no prefix). */
export function easingToTailwind(easing: Easing): string {
  switch (easing) {
    case "linear":
      return "ease-linear";
    case "in":
      return "ease-in";
    case "out":
      return "ease-out";
    case "in-out":
      return "ease-in-out";
    default:
      // Custom cubic-bezier() strings are not part of Tailwind's core scale;
      // Surface the raw value so the host theme can wire up a JIT entry.
      return easing;
  }
}

export function easingToCss(easing: Easing): string {
  switch (easing) {
    case "linear":
      return "linear";
    case "in":
      return "cubic-bezier(0.4, 0, 1, 1)";
    case "out":
      return "cubic-bezier(0, 0, 0.2, 1)";
    case "in-out":
      return "cubic-bezier(0.4, 0, 0.2, 1)";
    default:
      return easing;
  }
}

/** Maps a transition-property alias to Tailwind's `transition-*` utility. */
export function transitionPropertyToTailwind(prop: TransitionProperty): string {
  switch (prop) {
    case "none":
      return "transition-none";
    case "all":
      return "transition";
    case "colors":
      return "transition-colors";
    case "opacity":
      return "transition-opacity";
    case "shadow":
      return "transition-shadow";
    case "transform":
      return "transition";
    default:
      return `transition-${prop}`;
  }
}

export function transitionPropertyToCss(prop: TransitionProperty): string {
  switch (prop) {
    case "none":
      return "none";
    case "all":
      return "all";
    case "colors":
      return "background-color, border-color, color, fill, stroke";
    case "opacity":
      return "opacity";
    case "shadow":
      return "box-shadow";
    case "transform":
      return "transform";
    default:
      return prop;
  }
}

export function isBareLength(length: Length): length is number {
  return typeof length === "number";
}

let warnedBareLength = false;

export function warnBareLengthOnce(helper: string): void {
  if (warnedBareLength) return;
  warnedBareLength = true;
  console.warn(
    `[prism] Passing a bare number to \`${helper}(n)\` is deprecated: it is not valid CSS on its own. ` +
      `Use \`${helper}(rem(n))\` or \`${helper}(px(n))\` instead. ` +
      `Bare numbers are still interpreted as Tailwind spacing scale steps in the Tailwind compiler, ` +
      `and as n*0.25rem in CSS Modules, for backward compatibility.`,
  );
}
