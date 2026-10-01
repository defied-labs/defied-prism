/**
 * Minimal color math for theming: parse the formats people actually write
 * (hex, rgb(), oklch()), mix, and measure WCAG contrast.
 */

/** sRGB channels in 0..1 */
export type Rgb = [number, number, number];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function parseHex(value: string): Rgb | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!m) return null;
  const hex = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join("") : m[1]!;
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb;
}

/** "50%" -> 0.5 of `max`, "0.5" -> 0.5 */
function number(token: string, max = 1): number {
  return token.endsWith("%") ? (parseFloat(token) / 100) * max : parseFloat(token);
}

function parseRgb(value: string): Rgb | null {
  const m = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (!m) return null;
  const parts = m[1]!.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  return parts.slice(0, 3).map((p) => clamp01(number(p, 255) / 255)) as Rgb;
}

const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function parseOklch(value: string): Rgb | null {
  const m = /^oklch\(([^)]+)\)$/i.exec(value);
  if (!m) return null;
  const [l, c, h] = m[1]!.split(/[\s/]+/).filter(Boolean);
  if (l === undefined || c === undefined || h === undefined) return null;
  const L = number(l);
  const C = number(c, 0.4);
  const H = (parseFloat(h) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  // OKLab -> linear sRGB (Björn Ottosson)
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((ch) => clamp01(toGamma(ch))) as Rgb;
}

/** Parses hex, rgb() or oklch(). Throws on anything else. */
export function parseColor(value: string): Rgb {
  const v = value.trim();
  const rgb = parseHex(v) ?? parseRgb(v) ?? parseOklch(v);
  if (!rgb) throw new Error(`[prism] Unsupported color "${value}" (use hex, rgb() or oklch()).`);
  return rgb;
}

export function toHex([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0")).join("");
}

/**
 * Mixes `amount` (0..1) of `b` into `a` in sRGB space, which tracks
 * perceived lightness closely enough for hover/active shades.
 */
export function mix(a: string, b: string, amount: number): string {
  const [x, y] = [parseColor(a), parseColor(b)];
  return toHex(x.map((c, i) => c * (1 - amount) + y[i]! * amount) as Rgb);
}

/** WCAG 2.x relative luminance */
export function luminance(color: string): number {
  const [r, g, b] = parseColor(color).map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1..21 */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/**
 * Darkens (or lightens) `color` in small steps until it reaches `ratio`
 * against `background`. Returns the closest color found.
 */
export function ensureContrast(color: string, background: string, ratio: number): string {
  const toward = luminance(background) > 0.18 ? "#000000" : "#ffffff";
  let result = toHex(parseColor(color));
  for (let step = 1; step <= 20 && contrast(result, background) < ratio; step++) {
    result = mix(color, toward, step * 0.05);
  }
  return result;
}
