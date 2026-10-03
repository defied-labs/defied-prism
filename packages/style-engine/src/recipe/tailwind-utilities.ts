import { cssVarName, TAILWIND_NAMESPACE, TOKEN_PREFIX, type TokenPath } from "@defied/prism-tokens";

/**
 * CSS property -> Tailwind utility prefix, per token group. A declaration
 * whose value is exactly one token becomes `<prefix>-prism-<key>` when the
 * group has a Tailwind theme namespace (`bg-prism-primary`, `px-prism-4`), or
 * `<prefix>-(--prism-…)` when it doesn't (`z-(--prism-z-modal)`).
 *
 * Only properties whose utility sets that same property are listed, so the
 * Tailwind output stays equivalent to the CSS targets.
 */
const COLOR: Record<string, string> = {
  background: "bg",
  "background-color": "bg",
  color: "text",
  "border-color": "border",
  "border-top-color": "border-t",
  "border-right-color": "border-r",
  "border-bottom-color": "border-b",
  "border-left-color": "border-l",
  "outline-color": "outline",
  "accent-color": "accent",
  "caret-color": "caret",
  "text-decoration-color": "decoration",
  fill: "fill",
  stroke: "stroke",
};

const SIZE: Record<string, string> = {
  padding: "p",
  "padding-inline": "px",
  "padding-block": "py",
  "padding-top": "pt",
  "padding-right": "pr",
  "padding-bottom": "pb",
  "padding-left": "pl",
  "padding-inline-start": "ps",
  "padding-inline-end": "pe",
  margin: "m",
  "margin-inline": "mx",
  "margin-block": "my",
  "margin-top": "mt",
  "margin-right": "mr",
  "margin-bottom": "mb",
  "margin-left": "ml",
  "margin-inline-start": "ms",
  "margin-inline-end": "me",
  gap: "gap",
  "row-gap": "gap-y",
  "column-gap": "gap-x",
  width: "w",
  height: "h",
  "min-width": "min-w",
  "min-height": "min-h",
  "max-width": "max-w",
  "max-height": "max-h",
  inset: "inset",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
};

const BY_GROUP: Record<string, Record<string, string>> = {
  color: COLOR,
  space: SIZE,
  control: SIZE,
  radius: { "border-radius": "rounded" },
  font: { "font-family": "font" },
  text: { "font-size": "text" },
  leading: { "line-height": "leading" },
  weight: { "font-weight": "font" },
  shadow: { "box-shadow": "shadow" },
  easing: { "transition-timing-function": "ease" },
  duration: { "transition-duration": "duration" },
  z: { "z-index": "z" },
  opacity: { opacity: "opacity" },
};

/** Literal values with an exact utility equivalent. */
const LITERAL: Record<string, string> = {
  "display:flex": "flex",
  "display:inline-flex": "inline-flex",
  "display:grid": "grid",
  "display:inline-grid": "inline-grid",
  "display:block": "block",
  "display:inline-block": "inline-block",
  "display:inline": "inline",
  "display:contents": "contents",
  "display:none": "hidden",
  "position:relative": "relative",
  "position:absolute": "absolute",
  "position:fixed": "fixed",
  "position:sticky": "sticky",
  "flex-direction:row": "flex-row",
  "flex-direction:column": "flex-col",
  "flex-wrap:wrap": "flex-wrap",
  "flex-wrap:nowrap": "flex-nowrap",
  "flex-shrink:0": "shrink-0",
  "flex-grow:1": "grow",
  "flex:1": "flex-1",
  "align-items:center": "items-center",
  "align-items:flex-start": "items-start",
  "align-items:start": "items-start",
  "align-items:flex-end": "items-end",
  "align-items:end": "items-end",
  "align-items:stretch": "items-stretch",
  "align-items:baseline": "items-baseline",
  "justify-content:center": "justify-center",
  "justify-content:flex-start": "justify-start",
  "justify-content:flex-end": "justify-end",
  "justify-content:space-between": "justify-between",
  "cursor:pointer": "cursor-pointer",
  "cursor:not-allowed": "cursor-not-allowed",
  "cursor:default": "cursor-default",
  "white-space:nowrap": "whitespace-nowrap",
  "overflow:hidden": "overflow-hidden",
  "overflow:auto": "overflow-auto",
  "overflow-x:auto": "overflow-x-auto",
  "overflow-y:auto": "overflow-y-auto",
  "width:100%": "w-full",
  "height:100%": "h-full",
  "max-width:100%": "max-w-full",
  "margin:0": "m-0",
  "padding:0": "p-0",
  "inset:0": "inset-0",
  "border-style:solid": "border-solid",
  "border-style:none": "border-none",
  "box-sizing:border-box": "box-border",
  "appearance:none": "appearance-none",
  "pointer-events:none": "pointer-events-none",
  "list-style:none": "list-none",
  "text-decoration-line:underline": "underline",
  "text-decoration-line:none": "no-underline",
  "text-align:start": "text-start",
  "text-align:center": "text-center",
  "font-style:italic": "italic",
  "user-select:none": "select-none",
  "background:transparent": "bg-transparent",
  "background-color:transparent": "bg-transparent",
  "border-color:transparent": "border-transparent",
  "color:inherit": "text-inherit",
  "vertical-align:middle": "align-middle",
};

/** The utility for a declaration, or undefined when it needs an arbitrary property. */
export function tailwindUtility(property: string, value: string, token?: TokenPath): string | undefined {
  if (token) {
    const [group, key] = token.split(".") as [string, string];
    const prefix = BY_GROUP[group]?.[property];
    if (!prefix) return undefined;
    return TAILWIND_NAMESPACE[group] ? `${prefix}-${TOKEN_PREFIX}-${key}` : `${prefix}-(${cssVarName(token)})`;
  }
  return LITERAL[`${property}:${value.trim()}`];
}
