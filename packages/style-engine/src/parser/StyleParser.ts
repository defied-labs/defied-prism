import type { StyleDefinition, StyleNode, VariantNode } from "../types";

export interface ParsedStyle {
  base: StyleNode[];

  variants: Record<string, StyleNode[]>;
}

/**
 * Whether a variant name encodes a CSS pseudo selector.
 *
 * Pseudo-classes use a single leading colon (`:hover`, `:focus-visible`),
 * pseudo-elements use two (`::before`, `::after`). Both are routed through
 * the variants map by the parsers and compilers.
 */
export function isPseudoSelector(name: string): boolean {
  return name.startsWith(":");
}

export function isPseudoElement(name: string): boolean {
  return name.startsWith("::");
}

export function isPseudoClass(name: string): boolean {
  return isPseudoSelector(name) && !isPseudoElement(name);
}

export class StyleParser {
  parse(definition: StyleDefinition): ParsedStyle {
    const variants: Record<string, StyleNode[]> = {
      ...definition.variants,
    };

    // Pseudo helpers may be dropped directly into `base` (chained after
    // property nodes). Lift any such VariantNode into the variants map so
    // the compilers can handle them uniformly.
    const base: StyleNode[] = [];
    for (const node of definition.base) {
      if (node && typeof node === "object" && node.type === "variant") {
        const variant = node as VariantNode;
        variants[variant.name] = [
          ...(variants[variant.name] ?? []),
          ...variant.styles,
        ];
      } else {
        base.push(node);
      }
    }

    return {
      base: this.normalize(base),

      variants: this.parseVariants(variants),
    };
  }

  private parseVariants(variants: Record<string, StyleNode[]>) {
    const result: Record<string, StyleNode[]> = {};

    for (const [name, styles] of Object.entries(variants)) {
      result[name] = this.normalize(styles);
    }

    return result;
  }

  private normalize(nodes: StyleNode[]) {
    return nodes.map((node) => node);
  }
}
