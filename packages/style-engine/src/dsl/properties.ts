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
