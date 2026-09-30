import {
  durationToTailwindScale,
  easingToTailwind,
  lengthToTailwindScale,
  transitionPropertyToTailwind,
} from "../../dsl/units";
import type { TransitionOptions } from "../../dsl/properties";
export type { TransitionOptions } from "../../dsl/properties";

/**
 * Display property mappings
 */
export const DISPLAY_MAP: Record<string, string> = {
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  "inline-grid": "inline-grid",
  block: "block",
  "inline-block": "inline-block",
  inline: "inline",
  table: "table",
  "table-caption": "table-caption",
  "table-cell": "table-cell",
  "table-column": "table-column",
  "table-column-group": "table-column-group",
  "table-footer-group": "table-footer-group",
  "table-header-group": "table-header-group",
  "table-row": "table-row",
  "table-row-group": "table-row-group",
  "flow-root": "flow-root",
  contents: "contents",
  "list-item": "list-item",
  hidden: "hidden",
};

/**
 * Border radius mappings
 */
export const BORDER_RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/**
 * Max-width mappings
 */
export const MAX_WIDTH_MAP: Record<string, string> = {
  none: "max-w-none",
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
  min: "max-w-min",
  max: "max-w-max",
  fit: "max-w-fit",
  prose: "max-w-prose",
  "screen-sm": "max-w-screen-sm",
  "screen-md": "max-w-screen-md",
  "screen-lg": "max-w-screen-lg",
  "screen-xl": "max-w-screen-xl",
  "screen-2xl": "max-w-screen-2xl",
};

/**
 * Background size mappings
 */
export const BACKGROUND_SIZE_MAP: Record<string, string> = {
  auto: "bg-auto",
  cover: "bg-cover",
  contain: "bg-contain",
};

/**
 * Background repeat mappings
 */
export const BACKGROUND_REPEAT_MAP: Record<string, string> = {
  repeat: "bg-repeat",
  "no-repeat": "bg-no-repeat",
  "repeat-x": "bg-repeat-x",
  "repeat-y": "bg-repeat-y",
  round: "bg-repeat-round",
  space: "bg-repeat-space",
};

/**
 * Background attachment mappings
 */
export const BACKGROUND_ATTACHMENT_MAP: Record<string, string> = {
  scroll: "bg-scroll",
  fixed: "bg-fixed",
  local: "bg-local",
};

/**
 * Background clip mappings
 */
export const BACKGROUND_CLIP_MAP: Record<string, string> = {
  "border-box": "bg-clip-border",
  "padding-box": "bg-clip-padding",
  "content-box": "bg-clip-content",
  text: "bg-clip-text",
};

/**
 * Background origin mappings
 */
export const BACKGROUND_ORIGIN_MAP: Record<string, string> = {
  "border-box": "bg-origin-border",
  "padding-box": "bg-origin-padding",
  "content-box": "bg-origin-content",
};

/**
 * Letter spacing mappings
 */
export const LETTER_SPACING_MAP: Record<string, string> = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
  widest: "tracking-widest",
};

/**
 * Text decoration mappings
 */
export const TEXT_DECORATION_MAP: Record<string, string> = {
  none: "no-underline",
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
};

/**
 * Text transform mappings
 */
export const TEXT_TRANSFORM_MAP: Record<string, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  "normal-case": "normal-case",
};

/**
 * White space mappings
 */
export const WHITE_SPACE_MAP: Record<string, string> = {
  normal: "whitespace-normal",
  nowrap: "whitespace-nowrap",
  pre: "whitespace-pre",
  "pre-wrap": "whitespace-pre-wrap",
  "pre-line": "whitespace-pre-line",
};

/**
 * Word break mappings
 */
export const WORD_BREAK_MAP: Record<string, string> = {
  normal: "break-normal",
  "break-all": "break-all",
  "keep-all": "break-keep",
  "break-word": "break-words",
};

/**
 * User select mappings
 */
export const USER_SELECT_MAP: Record<string, string> = {
  none: "select-none",
  text: "select-text",
  all: "select-all",
  auto: "select-auto",
};

/**
 * Resize mappings
 */
export const RESIZE_MAP: Record<string, string> = {
  none: "resize-none",
  both: "resize",
  horizontal: "resize-x",
  vertical: "resize-y",
};

/**
 * Shadow mappings
 */
export const SHADOW_MAP: Record<string, string> = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
  none: "shadow-none",
};

/**
 * Transform mappings (for transform property)
 */
export const TRANSFORM_MAP: Record<string, string> = {
  none: "transform-none",
  "scale-0": "scale-0",
  "scale-50": "scale-50",
  "scale-75": "scale-75",
  "scale-90": "scale-90",
  "scale-95": "scale-95",
  "scale-100": "scale-100",
  "scale-105": "scale-105",
  "scale-110": "scale-110",
  "scale-125": "scale-125",
  "scale-150": "scale-150",
};

/**
 * Font weight mappings
 */
export const FONT_WEIGHT_MAP: Record<string | number, string> = {
  100: "font-thin",
  200: "font-extralight",
  300: "font-light",
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
  800: "font-extrabold",
  900: "font-black",
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

/**
 * Font size mappings
 */
export const FONT_SIZE_MAP: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
  "8xl": "text-8xl",
  "9xl": "text-9xl",
};

/**
 * Line height mappings
 */
export const LINE_HEIGHT_MAP: Record<string, string> = {
  tight: "leading-tight",
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
  3: "leading-3",
  4: "leading-4",
  5: "leading-5",
  6: "leading-6",
  7: "leading-7",
  8: "leading-8",
  9: "leading-9",
  10: "leading-10",
};

/**
 * Cursor mappings
 */
export const CURSOR_MAP: Record<string, string> = {
  auto: "cursor-auto",
  default: "cursor-default",
  pointer: "cursor-pointer",
  wait: "cursor-wait",
  text: "cursor-text",
  move: "cursor-move",
  "not-allowed": "cursor-not-allowed",
  help: "cursor-help",
  "zoom-in": "cursor-zoom-in",
  "zoom-out": "cursor-zoom-out",
  grab: "cursor-grab",
  grabbing: "cursor-grabbing",
  "ew-resize": "cursor-ew-resize",
  "ns-resize": "cursor-ns-resize",
  "nesw-resize": "cursor-nesw-resize",
  "nwse-resize": "cursor-nwse-resize",
  "col-resize": "cursor-col-resize",
  "row-resize": "cursor-row-resize",
  "all-scroll": "cursor-all-scroll",
  progress: "cursor-progress",
  cell: "cursor-cell",
  crosshair: "cursor-crosshair",
  "vertical-text": "cursor-vertical-text",
  alias: "cursor-alias",
  copy: "cursor-copy",
  "no-drop": "cursor-no-drop",
};

/**
 * Width size mappings
 */
export const WIDTH_SIZE_MAP: Record<string, string> = {
  auto: "w-auto",
  full: "w-full",
  screen: "w-screen",
  min: "w-min",
  max: "w-max",
  fit: "w-fit",
};

/**
 * Height size mappings
 */
export const HEIGHT_SIZE_MAP: Record<string, string> = {
  auto: "h-auto",
  full: "h-full",
  screen: "h-screen",
  min: "h-min",
  max: "h-max",
  fit: "h-fit",
};

/**
 * Compile transition options to Tailwind classes
 */
export function compileTransitionToTailwind(opts: TransitionOptions): string[] {
  const out: string[] = [];
  const prop = opts.property ?? "all";
  out.push(transitionPropertyToTailwind(prop));

  if (opts.duration !== undefined) {
    out.push(`duration-${durationToTailwindScale(opts.duration, "duration")}`);
  }
  if (opts.timing !== undefined) {
    out.push(easingToTailwind(opts.timing));
  }
  if (opts.delay !== undefined) {
    out.push(`delay-${durationToTailwindScale(opts.delay, "delay")}`);
  }
  return out;
}

/**
 * Map shadow values to Tailwind classes
 */
export function compileShadowToTailwind(value: string): string[] {
  const result = SHADOW_MAP[value];
  return result ? [result] : [`shadow-[${value}]`];
}

/**
 * Map transform values to Tailwind classes
 */
export function compileTransformToTailwind(value: string): string[] {
  const result = TRANSFORM_MAP[value];
  return result ? [result, "transform"] : [];
}

/**
 * Map z-index values to Tailwind classes
 */
export function compileZIndexToTailwind(value: number | string): string[] {
  if (value === "auto") return ["z-auto"];
  return [`z-${value}`];
}

/**
 * Map opacity values to Tailwind classes
 */
export function compileOpacityToTailwind(value: number | string): string[] {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num <= 1) {
    return [`opacity-${Math.round(num * 100)}`];
  }
  return [`opacity-${num}`];
}

/**
 * Map cursor values to Tailwind classes
 */
export function compileCursorToTailwind(value: string): string[] {
  const result = CURSOR_MAP[value];
  return result ? [result] : [`cursor-[${value}]`];
}

/**
 * Map position values to Tailwind classes
 */
export function compilePositionToTailwind(value: string): string[] {
  return [value];
}

/**
 * Map width to Tailwind classes
 */
export function compileWidthToTailwind(value: string | number): string[] {
  const str = String(value);
  const result = WIDTH_SIZE_MAP[str];
  return result ? [result] : [`w-[${str}]`];
}

/**
 * Map height to Tailwind classes
 */
export function compileHeightToTailwind(value: string | number): string[] {
  const str = String(value);
  const result = HEIGHT_SIZE_MAP[str];
  return result ? [result] : [`h-[${str}]`];
}

/**
 * Map margin to Tailwind classes
 */
export function compileMarginToTailwind(
  prop: string,
  value: string | number,
): string[] {
  const str = String(value);
  const prefix =
    prop === "margin"
      ? "m"
      : prop === "marginX"
        ? "mx"
        : prop === "marginY"
          ? "my"
          : prop === "marginTop"
            ? "mt"
            : prop === "marginRight"
              ? "mr"
              : prop === "marginBottom"
                ? "mb"
                : "ml";
  if (str === "auto") return [`${prefix}-auto`];
  return [`${prefix}-${lengthToTailwindScale(str as any, prop)}`];
}

/**
 * Map padding to Tailwind classes
 */
export function compilePaddingToTailwind(
  prop: string,
  value: string | number,
): string[] {
  const str = String(value);
  const prefix =
    prop === "padding"
      ? "p"
      : prop === "paddingX"
        ? "px"
        : prop === "paddingY"
          ? "py"
          : prop === "paddingTop"
            ? "pt"
            : prop === "paddingRight"
              ? "pr"
              : prop === "paddingBottom"
                ? "pb"
                : "pl";
  return [`${prefix}-${lengthToTailwindScale(str as any, prop)}`];
}

/**
 * Map border styles to Tailwind classes
 */
export function compileBorderToTailwind(prop: string, value: string): string[] {
  const prefix =
    prop === "border"
      ? "border"
      : prop === "borderX"
        ? "border-x"
        : prop === "borderY"
          ? "border-y"
          : prop === "borderTop"
            ? "border-t"
            : prop === "borderRight"
              ? "border-r"
              : prop === "borderBottom"
                ? "border-b"
                : "border-l";
  if (value === "none" || value === "0") return [`${prefix}-0`];
  return [`${prefix}`, `${prefix}-${value}`];
}

/**
 * Map fontWeight to Tailwind classes
 */
export function compileFontWeightToTailwind(value: number | string): string[] {
  const result = FONT_WEIGHT_MAP[value];
  return result ? [result] : [`font-[${value}]`];
}

/**
 * Map textAlign to Tailwind classes
 */
export function compileTextAlignToTailwind(value: string): string[] {
  return [`text-${value}`];
}

/**
 * Map fontSize to Tailwind classes
 */
export function compileFontSizeToTailwind(value: string | number): string[] {
  const result = FONT_SIZE_MAP[String(value)];
  return result ? [result] : [`text-[${value}]`];
}

/**
 * Map lineHeight to Tailwind classes
 */
export function compileLineHeightToTailwind(value: string | number): string[] {
  if (value === "normal") return ["leading-normal"];
  if (value === "none") return ["leading-none"];
  if (typeof value === "number") return [`leading-[${value}]`];
  const str = String(value);
  const result = LINE_HEIGHT_MAP[str];
  return result ? [result] : [`leading-[${str}]`];
}
