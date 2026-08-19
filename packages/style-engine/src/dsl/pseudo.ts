import type { StyleNode, VariantNode } from "../types";

/**
 * Pseudo-element selectors create an extra box that is rendered relative to
 * the host element (`::before`, `::after`). Pseudo-class selectors match
 * the host based on its interaction/state (`:hover`, `:focus`, ...).
 *
 * To keep both compilers (CSS Modules + Tailwind) able to consume a single
 * `ParsedStyle`, pseudo selectors are stored as {@link VariantNode}s whose
 * `name` follows a CSS-flavoured convention:
 *
 * - pseudo-**elements** keep the leading `::` marker, e.g. `"::before"`.
 * - pseudo-**classes** keep the leading `:` marker, e.g. `:hover`.
 *
 * The compilers detect the marker and emit the proper selector string
 * (CSS Modules) or variant prefix (Tailwind).
 */

export interface PseudoScope {
  readonly name: string;
  readonly styles: StyleNode[];
}

function makePseudo(name: string, styles: StyleNode[]): VariantNode {
  return { type: "variant", name, styles };
}

/**
 * Generic escape hatch for selectors we don't ship a dedicated helper for,
 * e.g. `pseudo("::marker", [...])`.
 *
 * Names must already include the CSS marker:
 * - `::element` for pseudo-elements
 * - `:state` for pseudo-classes
 */
export function pseudo(name: string, ...styles: StyleNode[]): VariantNode {
  if (!name.startsWith(":")) {
    throw new Error(
      `[prism] pseudo selector names must start with ":" (got "${name}").`,
    );
  }
  return makePseudo(name, styles);
}

// --- pseudo-elements ------------------------------------------------------

export function before(...styles: StyleNode[]): VariantNode {
  return makePseudo("::before", styles);
}

export function after(...styles: StyleNode[]): VariantNode {
  return makePseudo("::after", styles);
}

// --- pseudo-classes -------------------------------------------------------

export function hover(...styles: StyleNode[]): VariantNode {
  return makePseudo(":hover", styles);
}

export function focus(...styles: StyleNode[]): VariantNode {
  return makePseudo(":focus", styles);
}

export function focusVisible(...styles: StyleNode[]): VariantNode {
  return makePseudo(":focus-visible", styles);
}

export function active(...styles: StyleNode[]): VariantNode {
  return makePseudo(":active", styles);
}

export function disabled(...styles: StyleNode[]): VariantNode {
  return makePseudo(":disabled", styles);
}

export function placeholder(...styles: StyleNode[]): VariantNode {
  return makePseudo(":placeholder", styles);
}

/** Sentinel helpers for grouping intent inside a definition. */
export const pseudoScopes = {
  before,
  after,
  hover,
  focus,
  focusVisible,
  active,
  disabled,
  placeholder,
  custom: pseudo,
} as const;
