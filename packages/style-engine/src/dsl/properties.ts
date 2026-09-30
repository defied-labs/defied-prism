import { content, property } from "./context";
import {
  isBareLength,
  warnBareLengthOnce,
  type Easing,
  type Length,
  type RadiusScale,
  type TransitionProperty,
} from "./units";

export { content, property };

export { type Easing, type RadiusScale, type TransitionProperty };

/** Shadow size scale */
export type ShadowScale = "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none";

/** Transform scale */
export type TransformScale = "none" | "scale-0" | "scale-50" | "scale-75" | "scale-90" | "scale-95" | "scale-100" | "scale-105" | "scale-110" | "scale-125" | "scale-150";

/** Z-index scale */
export type ZIndexScale = "auto" | 0 | 10 | 20 | 30 | 40 | 50 | "auto";

/** Filter scale */
export type FilterScale = "none" | "blur" | "brightness" | "contrast" | "drop-shadow" | "grayscale" | "hue-rotate" | "invert" | "saturate" | "sepia";

/** Bare `Length` literal (e.g. `4`) passes through; everything else warns. */
function useLength<T extends Length>(value: T, helper: string): T {
  if (isBareLength(value)) {
    warnBareLengthOnce(helper);
  }
  return value;
}

export function bg(value: string) {
  return property("background", value);
}

export function text(value: string) {
  return property("color", value);
}

export function rounded(value: RadiusScale) {
  return property("borderRadius", value);
}

export function data(attribute: string, value: string) {
  return property(`data-${attribute}`, value);
}

export function paddingX(value: Length) {
  useLength(value, "paddingX");
  return property("paddingX", value);
}

export function paddingY(value: Length) {
  useLength(value, "paddingY");
  return property("paddingY", value);
}

export function flex() {
  return property("display", "flex");
}

export function flexProperty(value: string | number) {
  return property("flex", value);
}

export function gap(value: Length) {
  useLength(value, "gap");
  return property("gap", value);
}

export function itemsCenter() {
  return property("alignItems", "center");
}

export function justifyCenter() {
  return property("justifyContent", "center");
}

export function borderRadius(value: RadiusScale) {
  return property("borderRadius", value);
}

export function background(value: string) {
  return property("background", value);
}

export function color(value: string) {
  return property("color", value);
}

/**
 * Declares the timing-function part of a transition. Use as the `ease`
 * slot of {@link transition}; emits Tailwind `ease-*` (or a custom string)
 * and a CSS `transition-timing-function` declaration.
 */
export function ease(timing: Easing) {
  return property("transitionTimingFunction", timing);
}

export interface TransitionOptions {
  /** What property to transition. Defaults to `"all"`. */
  property?: TransitionProperty;
  /** Tailwind duration step (`200`) or CSS string (`"200ms"`). */
  duration?: number | string;
  /** Timing function; see {@link ease}. Defaults to Tailwind's default. */
  timing?: Easing;
  /** Tailwind delay step (`150`) or CSS string (`"150ms"`). */
  delay?: number | string;
}

/**
 * Expresses a complete CSS transition (property + duration + timing + delay).
 *
 * `transition({ property: "colors", duration: 200, timing: "out", delay: 150 })`
 * expands to Tailwind `transition-colors duration-200 ease-out delay-150`
 * and to a CSS Modules shorthand `transition: ...;` declaration.
 */
export function transition(options: TransitionOptions) {
  return property("transition", options);
}

/**
 * Add box-shadow styles
 *
 * `shadow("md")` -> Tailwind `shadow-md` / CSS `box-shadow: var(--shadow-md)`
 * `shadow("lg")` -> Tailwind `shadow-lg` / CSS `box-shadow: var(--shadow-lg)`
 */
export function shadow(value: ShadowScale) {
  return property("boxShadow", value);
}

/**
 * Add transform styles
 *
 * `transform("scale-105")` -> Tailwind `transform scale-105` / CSS `transform: var(--transform-scale-105)`
 */
export function transform(value: TransformScale) {
  return property("transform", value);
}

/**
 * Add z-index styles
 *
 * `zIndex(50)` -> Tailwind `z-50` / CSS `z-index: 50`
 */
export function zIndex(value: number | "auto") {
  return property("zIndex", value);
}

/**
 * Add filter styles
 *
 * `filter("blur")` -> Tailwind `filter blur` / CSS `filter: var(--filter-blur)`
 */
export function filter(value: FilterScale) {
  return property("filter", value);
}

/**
 * Add opacity styles
 *
 * `opacity(50)` -> Tailwind `opacity-50` / CSS `opacity: 0.5`
 */
export function opacity(value: number | string) {
  return property("opacity", value);
}

/**
 * Add overflow styles
 *
 * `overflow("hidden")` -> Tailwind `overflow-hidden` / CSS `overflow: hidden`
 */
export function overflow(value: "visible" | "hidden" | "scroll" | "auto" | "clip") {
  return property("overflow", value);
}

/**
 * Add cursor styles
 *
 * `cursor("pointer")` -> Tailwind `cursor-pointer` / CSS `cursor: pointer`
 */
export function cursor(value: string) {
  return property("cursor", value);
}

/**
 * Add pointer-events styles
 *
 * `pointerEvents("none")` -> Tailwind `pointer-events-none` / CSS `pointer-events: none`
 */
export function pointerEvents(value: "auto" | "none") {
  return property("pointerEvents", value);
}

/**
 * Add user-select styles
 *
 * `userSelect("none")` -> Tailwind `select-none` / CSS `user-select: none`
 */
export function userSelect(value: "none" | "text" | "all" | "auto" | "contain") {
  return property("userSelect", value);
}

/**
 * Add position styles
 *
 * `position("relative")` -> Tailwind `relative` / CSS `position: relative`
 */
export function position(value: "static" | "relative" | "absolute" | "fixed" | "sticky") {
  return property("position", value);
}

/**
 * Add inset (top/right/bottom/left) styles
 *
 * `inset(0)` -> Tailwind `inset-0` / CSS `top: 0; right: 0; bottom: 0; left: 0`
 */
export function inset(value: Length | "auto") {
  return property("inset", value);
}

/**
 * Add top/right/bottom/left individual styles
 */
export function top(value: Length | "auto") {
  return property("top", value);
}
export function right(value: Length | "auto") {
  return property("right", value);
}
export function bottom(value: Length | "auto") {
  return property("bottom", value);
}
export function left(value: Length | "auto") {
  return property("left", value);
}

/**
 * Add width/height styles
 */
export function width(value: Length | "auto" | "full" | "screen" | "min" | "max" | "fit") {
  return property("width", value);
}
export function height(value: Length | "auto" | "full" | "screen" | "min" | "max" | "fit") {
  return property("height", value);
}
export function minWidth(value: Length | "auto" | "full" | "min" | "max" | "fit") {
  return property("minWidth", value);
}
export function maxWidth(value: Length | "auto" | "full" | "min" | "max" | "fit") {
  return property("maxWidth", value);
}
export function minHeight(value: Length | "auto" | "full" | "min" | "max" | "fit") {
  return property("minHeight", value);
}
export function maxHeight(value: Length | "auto" | "full" | "min" | "max" | "fit") {
  return property("maxHeight", value);
}

/**
 * Add margin styles
 */
export function margin(value: Length | "auto") {
  return property("margin", value);
}
export function marginX(value: Length | "auto") {
  return property("marginX", value);
}
export function marginY(value: Length | "auto") {
  return property("marginY", value);
}
export function marginTop(value: Length | "auto") {
  return property("marginTop", value);
}
export function marginRight(value: Length | "auto") {
  return property("marginRight", value);
}
export function marginBottom(value: Length | "auto") {
  return property("marginBottom", value);
}
export function marginLeft(value: Length | "auto") {
  return property("marginLeft", value);
}

/**
 * Add padding styles (all sides)
 */
export function padding(value: Length) {
  useLength(value, "padding");
  return property("padding", value);
}
export function paddingTop(value: Length) {
  useLength(value, "paddingTop");
  return property("paddingTop", value);
}
export function paddingRight(value: Length) {
  useLength(value, "paddingRight");
  return property("paddingRight", value);
}
export function paddingBottom(value: Length) {
  useLength(value, "paddingBottom");
  return property("paddingBottom", value);
}
export function paddingLeft(value: Length) {
  useLength(value, "paddingLeft");
  return property("paddingLeft", value);
}

/**
 * Add border styles
 */
export function border(value: string) {
  return property("border", value);
}
export function borderX(value: string) {
  return property("borderX", value);
}
export function borderY(value: string) {
  return property("borderY", value);
}
export function borderTop(value: string) {
  return property("borderTop", value);
}
export function borderRight(value: string) {
  return property("borderRight", value);
}
export function borderBottom(value: string) {
  return property("borderBottom", value);
}
export function borderLeft(value: string) {
  return property("borderLeft", value);
}
export function borderWidth(value: Length) {
  useLength(value, "borderWidth");
  return property("borderWidth", value);
}
export function borderColor(value: string) {
  return property("borderColor", value);
}
export function borderStyle(value: "solid" | "dashed" | "dotted" | "double" | "none") {
  return property("borderStyle", value);
}

/**
 * Add outline styles
 */
export function outline(value: string) {
  return property("outline", value);
}
export function outlineWidth(value: Length) {
  useLength(value, "outlineWidth");
  return property("outlineWidth", value);
}
export function outlineColor(value: string) {
  return property("outlineColor", value);
}
export function outlineStyle(value: "solid" | "dashed" | "dotted" | "double" | "none") {
  return property("outlineStyle", value);
}
export function outlineOffset(value: Length) {
  useLength(value, "outlineOffset");
  return property("outlineOffset", value);
}

/**
 * Add ring/box-shadow styles (focus rings)
 */
export function ring(value: Length) {
  useLength(value, "ring");
  return property("ring", value);
}
export function ringColor(value: string) {
  return property("ringColor", value);
}
export function ringOffset(value: Length) {
  useLength(value, "ringOffset");
  return property("ringOffset", value);
}
export function ringOffsetColor(value: string) {
  return property("ringOffsetColor", value);
}
export function ringInset() {
  return property("ringInset", true);
}

/**
 * Add flexbox styles
 */
export function flexDirection(value: "row" | "row-reverse" | "column" | "column-reverse") {
  return property("flexDirection", value);
}
export function flexWrap(value: "wrap" | "nowrap" | "wrap-reverse") {
  return property("flexWrap", value);
}
export function flexGrow(value: number | "initial" | "inherit" | "unset") {
  return property("flexGrow", value);
}
export function flexShrink(value: number | "initial" | "inherit" | "unset") {
  return property("flexShrink", value);
}
export function flexBasis(value: Length | "auto" | "full") {
  useLength(value, "flexBasis");
  return property("flexBasis", value);
}
export function order(value: number | "first" | "last" | "none") {
  return property("order", value);
}

/**
 * Add grid styles
 */
export function gridTemplateColumns(value: string) {
  return property("gridTemplateColumns", value);
}
export function gridTemplateRows(value: string) {
  return property("gridTemplateRows", value);
}
export function gridColumn(value: string) {
  return property("gridColumn", value);
}
export function gridRow(value: string) {
  return property("gridRow", value);
}
export function gridAutoFlow(value: "row" | "column" | "dense" | "row-dense" | "column-dense") {
  return property("gridAutoFlow", value);
}
export function gridAutoColumns(value: string) {
  return property("gridAutoColumns", value);
}
export function gridAutoRows(value: string) {
  return property("gridAutoRows", value);
}

/**
 * Add text/font styles
 */
export function fontSize(value: Length) {
  useLength(value, "fontSize");
  return property("fontSize", value);
}
export function fontWeight(value: number | "thin" | "extralight" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black") {
  return property("fontWeight", value);
}
export function fontFamily(value: string) {
  return property("fontFamily", value);
}
export function fontStyle(value: "normal" | "italic" | "oblique") {
  return property("fontStyle", value);
}
export function lineHeight(value: Length | "normal" | "none" | number) {
  if (typeof value !== "number") useLength(value as Length, "lineHeight");
  return property("lineHeight", value);
}
export function letterSpacing(value: Length) {
  useLength(value, "letterSpacing");
  return property("letterSpacing", value);
}
export function textAlign(value: "left" | "center" | "right" | "justify" | "start" | "end") {
  return property("textAlign", value);
}
export function textDecoration(value: "none" | "underline" | "overline" | "line-through" | "blink") {
  return property("textDecoration", value);
}
export function textTransform(value: "uppercase" | "lowercase" | "capitalize" | "normal-case" | "none") {
  return property("textTransform", value);
}
export function textOverflow(value: "clip" | "ellipsis" | "fade") {
  return property("textOverflow", value);
}
export function whiteSpace(value: "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line" | "break-spaces") {
  return property("whiteSpace", value);
}
export function wordBreak(value: "normal" | "break-all" | "keep-all" | "break-word") {
  return property("wordBreak", value);
}
export function overflowWrap(value: "normal" | "break-word" | "anywhere") {
  return property("overflowWrap", value);
}

/**
 * Add display styles
 */
export function display(value: "block" | "inline-block" | "inline" | "flex" | "inline-flex" | "grid" | "inline-grid" | "table" | "inline-table" | "contents" | "hidden" | "none") {
  return property("display", value);
}
export function visibility(value: "visible" | "hidden" | "collapse") {
  return property("visibility", value);
}

/**
 * Add background styles
 */
export function backgroundColor(value: string) {
  return property("backgroundColor", value);
}
export function backgroundImage(value: string) {
  return property("backgroundImage", value);
}
export function backgroundPosition(value: string) {
  return property("backgroundPosition", value);
}
export function backgroundSize(value: "auto" | "cover" | "contain" | Length) {
  return property("backgroundSize", value);
}
export function backgroundRepeat(value: "repeat" | "no-repeat" | "repeat-x" | "repeat-y" | "round" | "space") {
  return property("backgroundRepeat", value);
}
export function backgroundAttachment(value: "scroll" | "fixed" | "local") {
  return property("backgroundAttachment", value);
}
export function backgroundClip(value: "border-box" | "padding-box" | "content-box" | "text") {
  return property("backgroundClip", value);
}
export function backgroundOrigin(value: "border-box" | "padding-box" | "content-box") {
  return property("backgroundOrigin", value);
}

/**
 * Add transition/animation styles
 */
export function animation(value: string) {
  return property("animation", value);
}
export function animationDuration(value: Length) {
  useLength(value, "animationDuration");
  return property("animationDuration", value);
}
export function animationDelay(value: Length) {
  useLength(value, "animationDelay");
  return property("animationDelay", value);
}
export function animationIterationCount(value: number | "infinite") {
  return property("animationIterationCount", value);
}
export function animationDirection(value: "normal" | "reverse" | "alternate" | "alternate-reverse") {
  return property("animationDirection", value);
}
export function animationFillMode(value: "none" | "forwards" | "backwards" | "both") {
  return property("animationFillMode", value);
}
export function animationPlayState(value: "running" | "paused") {
  return property("animationPlayState", value);
}
export function animationTimingFunction(value: Easing) {
  return property("animationTimingFunction", value);
}

/**
 * Add transform origin
 */
export function transformOrigin(value: string) {
  return property("transformOrigin", value);
}

/**
 * Add scale/rotate/translate/skew helpers
 */
export function scale(value: number | string) {
  return property("scale", value);
}
export function scaleX(value: number | string) {
  return property("scaleX", value);
}
export function scaleY(value: number | string) {
  return property("scaleY", value);
}
export function rotate(value: string) {
  return property("rotate", value);
}
export function translateX(value: Length) {
  useLength(value, "translateX");
  return property("translateX", value);
}
export function translateY(value: Length) {
  useLength(value, "translateY");
  return property("translateY", value);
}
export function skewX(value: string) {
  return property("skewX", value);
}
export function skewY(value: string) {
  return property("skewY", value);
}

/**
 * Add backdrop filter styles
 */
export function backdropBlur(value: Length | "none") {
  return property("backdropBlur", value);
}
export function backdropBrightness(value: string) {
  return property("backdropBrightness", value);
}
export function backdropContrast(value: string) {
  return property("backdropContrast", value);
}
export function backdropFilter(value: string) {
  return property("backdropFilter", value);
}
export function backdropGrayscale(value: string) {
  return property("backdropGrayscale", value);
}
export function backdropHueRotate(value: string) {
  return property("backdropHueRotate", value);
}
export function backdropInvert(value: string) {
  return property("backdropInvert", value);
}
export function backdropOpacity(value: string) {
  return property("backdropOpacity", value);
}
export function backdropSaturate(value: string) {
  return property("backdropSaturate", value);
}
export function backdropSepia(value: string) {
  return property("backdropSepia", value);
}

/**
 * Add resize/user-select styles
 */
export function resize(value: "none" | "both" | "horizontal" | "vertical") {
  return property("resize", value);
}
export function scrollMargin(value: Length) {
  useLength(value, "scrollMargin");
  return property("scrollMargin", value);
}
export function scrollPadding(value: Length) {
  useLength(value, "scrollPadding");
  return property("scrollPadding", value);
}

/**
 * Add accent-color
 */
export function accentColor(value: string) {
  return property("accentColor", value);
}

/**
 * Add appearance
 */
export function appearance(value: "none" | "auto" | "button" | "textfield" | "menulist" | "checkbox" | "radio") {
  return property("appearance", value);
}
