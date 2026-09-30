import type { Compiler } from "../Compiler";
import type { ParsedStyle } from "../../parser/StyleParser";
import type { StyleNode } from "../../types";
import { lengthToTailwindScale } from "../../dsl/units";
import type { Length } from "../../dsl/units";

import { tailwindPrefixFor } from "./tailwind-pseudo";
import {
  type HandlerContext,
  type CompilableNode,
} from "./handlers/PropertyHandler";
import { propertyHandlerRegistry } from "./handlers/PropertyHandlerRegistry";

export class TailwindCompiler implements Compiler {
  private readonly handlerContext: HandlerContext = {
    compileNodes: (nodes: StyleNode[]) => this.compileNodes(nodes),
    lengthToTailwindScale: (value: Length, property: string) =>
      lengthToTailwindScale(value, property),
    tailwindPrefixFor: (name: string) => tailwindPrefixFor(name),
  };

  compile(style: ParsedStyle): string {
    const base = this.compileNodes(style.base).filter(Boolean).join(" ");

    if (typeof base !== "string") {
      throw new Error(
        "[prism] TailwindCompiler internal error: base compilation returned non-string",
      );
    }

    return base;
  }

  compileVariants(style: ParsedStyle): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [name, nodes] of Object.entries(style.variants)) {
      const prefix = tailwindPrefixFor(name);
      const compiled = this.compileNodes(nodes).filter(Boolean).join(" ");

      if (compiled) {
        result[name] = prefix
          ? compiled
              .split(" ")
              .map((cls) => `${prefix}${cls}`)
              .join(" ")
          : compiled;
      }
    }

    for (const [key, value] of Object.entries(result)) {
      if (typeof value !== "string") {
        throw new Error(
          `[prism] TailwindCompiler internal error: variant "${key}" compilation returned non-string`,
        );
      }
    }

    return result;
  }

  private compileNodes(nodes: StyleNode[]): string[] {
    return nodes.flatMap((node): string[] => {
      const compilableNode = this.isCompilableNode(node);
      if (!compilableNode) return [];
      return propertyHandlerRegistry.compileProperty(
        compilableNode,
        this.handlerContext,
      );
    });
  }

  private isCompilableNode(node: StyleNode): CompilableNode | null {
    if (node.type === "property" || node.type === "variant") {
      return node as CompilableNode;
    }
    return null;
  }
}
