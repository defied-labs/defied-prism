import type { PropertyNode } from "../types";

export function property(key: string, value: unknown): PropertyNode {
  return {
    type: "property",

    property: key,

    value,
  };
}

/**
 * Sets the generated content for a pseudo-element block
 * (`::before` / `::after`). E.g. `before(content("\u2713"), ...)`.
 */
export function content(value: string): PropertyNode {
  return property("content", value);
}
