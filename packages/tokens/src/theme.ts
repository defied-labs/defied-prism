import { contrast, ensureContrast, mix, parseColor, toHex } from "./color";
import { themes, type ColorToken, type ThemeName } from "./tokens";

/** Text/background pairs the components actually render. WCAG AA = 4.5:1. */
export const TEXT_PAIRS: [ColorToken, ColorToken][] = [
  ["fg", "bg"],
  ["fg", "bg-subtle"],
  ["muted-fg", "bg"],
  ["muted-fg", "muted"],
  ["primary-fg", "primary"],
  ["primary-fg", "primary-hover"],
  ["primary-fg", "primary-active"],
  ["secondary-fg", "secondary"],
  ["secondary-fg", "secondary-hover"],
  ["secondary-fg", "secondary-active"],
  ["destructive-fg", "destructive"],
  ["destructive-fg", "destructive-hover"],
  ["destructive-fg", "destructive-active"],
  ["fg", "ghost-hover"],
  ["fg", "ghost-active"],
  ["link", "bg"],
  ["inverse-fg", "inverse"],
  ["link-hover", "bg"],
  // Text tones and inline code on page surfaces
  ["fg", "muted"],
  ["muted-fg", "bg-subtle"],
  ["success-fg", "bg"],
  ["warning-fg", "bg"],
  ["danger-fg", "bg"],
  ...(["neutral", "info", "success", "warning", "danger"] as const).flatMap(
    (s): [ColorToken, ColorToken][] => [
      [`${s}-fg`, `${s}-bg`],
      ["solid-fg", `${s}-solid`],
    ],
  ),
];

/** Non-text UI (focus ring, control borders) needs 3:1 (WCAG 1.4.11). */
export const UI_PAIRS: [ColorToken, ColorToken][] = [
  ["ring", "bg"],
  ["border-strong", "bg"],
  // Progress indicator on its track
  ...(["neutral", "info", "success", "warning", "danger"] as const).map(
    (s): [ColorToken, ColorToken] => [`${s}-solid`, "muted"],
  ),
];

export type ThemeColors = Record<ColorToken, string>;
export type ThemeOverrides = Partial<Record<ColorToken, string>>;

export interface ContrastIssue {
  theme: ThemeName;
  fg: ColorToken;
  bg: ColorToken;
  ratio: number;
  required: number;
}

/** Every text/UI pair in `colors` that misses WCAG AA. */
export function checkContrast(theme: ThemeName, colors: ThemeColors): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const [pairs, required] of [[TEXT_PAIRS, 4.5], [UI_PAIRS, 3]] as const) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(colors[fg], colors[bg]);
      if (ratio < required) issues.push({ theme, fg, bg, ratio, required });
    }
  }
  return issues;
}

/** Readable text on `background`: white or near-black, whichever contrasts more. */
function onColor(background: string): string {
  const dark = themes.light.fg;
  return contrast("#ffffff", background) >= contrast(dark, background) ? "#ffffff" : dark;
}

const ACTIONS = ["primary", "secondary", "destructive"] as const;

/**
 * A full theme from Prism's defaults plus your overrides. Set only the
 * brand color and the rest follows: hover/active shades, readable text on
 * it, the focus ring and link colors (nudged until they meet AA on the
 * page background). Anything you set explicitly is kept as-is.
 */
export function resolveTheme(theme: ThemeName, overrides: ThemeOverrides = {}): ThemeColors {
  const colors: ThemeColors = { ...themes[theme] };
  for (const [key, value] of Object.entries(overrides) as [ColorToken, string][]) {
    if (!(key in colors)) throw new Error(`[prism] Unknown color token "${key}".`);
    colors[key] = toHex(parseColor(value));
  }
  const given = (key: ColorToken) => key in overrides;

  for (const action of ACTIONS) {
    if (!given(action)) continue;
    const base = colors[action];
    if (!given(`${action}-fg`)) colors[`${action}-fg`] = onColor(base);
    // Hover/active move away from the text color, so contrast only improves
    const away = colors[`${action}-fg`] === "#ffffff" ? "#000000" : "#ffffff";
    if (!given(`${action}-hover`)) colors[`${action}-hover`] = mix(base, away, 0.15);
    if (!given(`${action}-active`)) colors[`${action}-active`] = mix(base, away, 0.3);
  }

  if (given("primary")) {
    const bg = colors.bg;
    if (!given("ring")) colors.ring = ensureContrast(colors.primary, bg, 3);
    if (!given("link")) colors.link = ensureContrast(colors.primary, bg, 4.5);
    // Hover always moves visibly, away from the page background
    const away = contrast("#ffffff", bg) > contrast("#000000", bg) ? "#ffffff" : "#000000";
    if (!given("link-hover")) colors["link-hover"] = ensureContrast(mix(colors.link, away, 0.25), bg, 4.5);
  }
  return colors;
}

function block(selector: string, entries: [ColorToken, string][], indent = ""): string {
  const lines = entries.map(([key, value]) => `${indent}  --prism-color-${key}: ${value};`);
  return `${indent}${selector} {\n${lines.join("\n")}\n${indent}}`;
}

export interface ThemeCssResult {
  css: string;
  issues: ContrastIssue[];
}

/**
 * CSS that re-themes Prism. Import it after `tokens.css`. Only colors that
 * differ from the defaults are written. Dark overrides default to the
 * light ones, so one brand color themes both.
 */
export function buildThemeCss(input: { light?: ThemeOverrides; dark?: ThemeOverrides }): ThemeCssResult {
  const light = resolveTheme("light", input.light);
  const dark = resolveTheme("dark", input.dark ?? input.light);
  const changed = (theme: ThemeName, colors: ThemeColors) =>
    (Object.entries(colors) as [ColorToken, string][]).filter(([key, value]) => themes[theme][key] !== value);

  const darkEntries = changed("dark", dark);
  const css = [
    "/* Generated by `prism theme`. Import after @defied/prism-tokens/tokens.css. */",
    block(":root", changed("light", light)),
    block('.dark,\n[data-theme="dark"]', darkEntries),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"]):not(.light)', darkEntries, "  ")}\n}`,
  ].join("\n\n");

  return { css: css + "\n", issues: [...checkContrast("light", light), ...checkContrast("dark", dark)] };
}
