export type StyleNode =
  | PropertyNode
  | VariantNode
  | ArrayNode
  | PseudoNode
  | UtilityNode;

export interface PropertyNode {
  type: "property";
  property: string;
  value: unknown;
}

export interface VariantNode {
  type: "variant";
  name: string;
  styles: StyleNode[];
}

export interface ArrayNode {
  type: "array";
  children: StyleNode[];
}

export interface PseudoNode {
  type: "pseudo";
  name: string;
  styles: StyleNode[];
}

export interface UtilityNode {
  type: "utility";
  name: string;
  value?: unknown;
}

export interface StyleDefinition {
  base: StyleNode[];
  variants?: Record<string, StyleNode[]>;
}
