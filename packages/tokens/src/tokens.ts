/**
 * The Defied Prism design tokens: the single source every CSS target,
 * framework adapter and theme is generated from.
 *
 * Colors are semantic and themed (every theme defines every color).
 * Everything else is theme-independent.
 */

const light = {
  // Surfaces & text
  bg: "#ffffff",
  "bg-subtle": "#fafafa",
  fg: "#09090b",
  muted: "#f4f4f5",
  "muted-fg": "#52525b",
  border: "#e4e4e7",
  "border-strong": "#71717a",
  ring: "#6d28d9",

  // Actions
  primary: "#6d28d9",
  "primary-fg": "#ffffff",
  "primary-hover": "#5b21b6",
  "primary-active": "#4c1d95",
  secondary: "#f4f4f5",
  "secondary-fg": "#18181b",
  "secondary-hover": "#e4e4e7",
  "secondary-active": "#d4d4d8",
  destructive: "#b91c1c",
  "destructive-fg": "#ffffff",
  "destructive-hover": "#991b1b",
  "destructive-active": "#7f1d1d",
  "ghost-hover": "#f4f4f5",
  "ghost-active": "#e4e4e7",
  link: "#6d28d9",
  "link-hover": "#4c1d95",
  // Overlays: backdrop behind modals; inverted surface for tooltips
  overlay: "rgb(9 9 11 / 0.5)",
  inverse: "#18181b",
  "inverse-fg": "#fafafa",

  // Status vocabulary: neutral | info | success | warning | danger
  "neutral-bg": "#f4f4f5",
  "neutral-fg": "#3f3f46",
  "neutral-border": "#d4d4d8",
  "neutral-solid": "#52525b",
  "info-bg": "#eff6ff",
  "info-fg": "#1e40af",
  "info-border": "#bfdbfe",
  "info-solid": "#1d4ed8",
  "success-bg": "#f0fdf4",
  "success-fg": "#166534",
  "success-border": "#bbf7d0",
  "success-solid": "#15803d",
  "warning-bg": "#fffbeb",
  "warning-fg": "#92400e",
  "warning-border": "#fde68a",
  "warning-solid": "#b45309",
  "danger-bg": "#fef2f2",
  "danger-fg": "#991b1b",
  "danger-border": "#fecaca",
  "danger-solid": "#b91c1c",
  // Text on any *-solid status color (independent of the brand color)
  "solid-fg": "#ffffff",
} as const;

export type ColorToken = keyof typeof light;

const dark: Record<ColorToken, string> = {
  bg: "#09090b",
  "bg-subtle": "#111113",
  fg: "#fafafa",
  muted: "#18181b",
  "muted-fg": "#a1a1aa",
  border: "#27272a",
  "border-strong": "#71717a",
  ring: "#a78bfa",

  primary: "#7c3aed",
  "primary-fg": "#ffffff",
  "primary-hover": "#6d28d9",
  "primary-active": "#5b21b6",
  secondary: "#27272a",
  "secondary-fg": "#fafafa",
  "secondary-hover": "#3f3f46",
  "secondary-active": "#52525b",
  destructive: "#dc2626",
  "destructive-fg": "#ffffff",
  "destructive-hover": "#b91c1c",
  "destructive-active": "#991b1b",
  "ghost-hover": "#27272a",
  "ghost-active": "#3f3f46",
  link: "#c4b5fd",
  "link-hover": "#ddd6fe",
  overlay: "rgb(0 0 0 / 0.7)",
  inverse: "#fafafa",
  "inverse-fg": "#18181b",

  "neutral-bg": "#18181b",
  "neutral-fg": "#d4d4d8",
  "neutral-border": "#3f3f46",
  "neutral-solid": "#71717a",
  "info-bg": "#172554",
  "info-fg": "#bfdbfe",
  "info-border": "#1e40af",
  "info-solid": "#2563eb",
  "success-bg": "#052e16",
  "success-fg": "#bbf7d0",
  "success-border": "#166534",
  "success-solid": "#15803d",
  "warning-bg": "#451a03",
  "warning-fg": "#fde68a",
  "warning-border": "#92400e",
  "warning-solid": "#b45309",
  "danger-bg": "#450a0a",
  "danger-fg": "#fecaca",
  "danger-border": "#991b1b",
  "danger-solid": "#dc2626",
  "solid-fg": "#ffffff",
};

export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;

/** Theme-independent tokens. */
export const scales = {
  space: {
    "0": "0",
    "0-5": "0.125rem",
    "1": "0.25rem",
    "1-5": "0.375rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  font: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  text: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    display: "3rem",
  },
  leading: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  duration: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    exit: "cubic-bezier(0.3, 0, 0.8, 0.15)",
  },
  focus: {
    "ring-width": "2px",
    "ring-offset": "2px",
  },
  control: {
    xs: "1.5rem",
    sm: "2rem",
    md: "2.5rem",
    lg: "2.75rem",
    xl: "3rem",
  },
  opacity: {
    disabled: "0.5",
  },
  z: {
    dropdown: "1000",
    overlay: "1100",
    modal: "1110",
    // Above modals, so a toast raised from a dialog stays visible
    toast: "1150",
    tooltip: "1200",
  },
} as const;

type Scales = typeof scales;

/** Every token path, e.g. "color.primary" or "space.4". */
export type TokenPath =
  | `color.${ColorToken}`
  | { [G in keyof Scales]: `${G}.${keyof Scales[G] & string}` }[keyof Scales];

/** A reference to a token inside a recipe value, e.g. "{color.primary}". */
export type TokenRef = `{${TokenPath}}`;
