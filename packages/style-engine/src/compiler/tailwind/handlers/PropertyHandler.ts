import type { StyleNode, PropertyNode, VariantNode } from "../../../types";

/** Node type that handlers actually receive - PropertyNode or VariantNode */
export type CompilableNode = PropertyNode | VariantNode;

export interface PropertyHandler {
  canHandle(property: string): boolean;
  compile(
    node: CompilableNode,
    context: HandlerContext,
  ): string[] | Promise<string[]>;
}

export interface HandlerContext {
  compileNodes: (nodes: StyleNode[]) => string[];
  lengthToTailwindScale: (value: any, property: string) => string | number;
  tailwindPrefixFor: (name: string) => string | undefined;
}
