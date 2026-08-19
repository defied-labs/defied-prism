import type { StyleDefinition, StyleNode } from "../types";

export function validateStyleNode(node: unknown, pathHint = "node"): void {
  if (!node || typeof node !== "object") {
    throw new Error(`[prism] Invalid style node at ${pathHint}: expected a style object.`);
  }

  const typedNode = node as Partial<StyleNode>;
  if (!typedNode.type || typeof typedNode.type !== "string") {
    throw new Error(`[prism] Invalid style node at ${pathHint}: missing "type" property.`);
  }

  const validTypes = new Set(["property", "variant", "array", "pseudo", "utility"]);
  if (!validTypes.has(typedNode.type)) {
    throw new Error(
      `[prism] Unknown style node type "${typedNode.type}" at ${pathHint}. Expected one of: ${Array.from(validTypes).join(", ")}.`,
    );
  }

  if (typedNode.type === "property" && !(node as any).property) {
    throw new Error(`[prism] PropertyNode at ${pathHint} must specify "property" name.`);
  }

  if ((typedNode.type === "variant" || typedNode.type === "pseudo") && !(node as any).name) {
    throw new Error(`[prism] ${typedNode.type} node at ${pathHint} must specify "name".`);
  }

  if (typedNode.type === "variant" || typedNode.type === "pseudo") {
    const styles = (node as any).styles;
    if (!Array.isArray(styles)) {
      throw new Error(`[prism] ${typedNode.type} node at ${pathHint} must specify a "styles" array.`);
    }
    styles.forEach((child, index) => validateStyleNode(child, `${pathHint}.${typedNode.type}[${index}]`));
  }

  if (typedNode.type === "array") {
    const children = (node as any).children;
    if (!Array.isArray(children)) {
      throw new Error(`[prism] ArrayNode at ${pathHint} must specify a "children" array.`);
    }
    children.forEach((child, index) => validateStyleNode(child, `${pathHint}.children[${index}]`));
  }
}

export function defineStyle(definition: {
  base: StyleNode[];
  variants?: Record<string, StyleNode[]>;
}): StyleDefinition {
  if (!definition || typeof definition !== "object") {
    throw new Error("[prism] defineStyle requires a style definition object.");
  }

  if (!Array.isArray(definition.base)) {
    throw new Error("[prism] defineStyle definition.base must be an array of StyleNodes.");
  }

  definition.base.forEach((node, idx) => validateStyleNode(node, `base[${idx}]`));

  if (definition.variants !== undefined) {
    if (typeof definition.variants !== "object" || definition.variants === null) {
      throw new Error("[prism] defineStyle definition.variants must be a record of StyleNode arrays.");
    }

    for (const [variantName, nodes] of Object.entries(definition.variants)) {
      if (!Array.isArray(nodes)) {
        throw new Error(
          `[prism] defineStyle variant "${variantName}" must be an array of StyleNodes.`,
        );
      }
      nodes.forEach((node, idx) =>
        validateStyleNode(node, `variants.${variantName}[${idx}]`),
      );
    }
  }

  return {
    base: definition.base,
    variants: definition.variants ?? {},
  };
}
