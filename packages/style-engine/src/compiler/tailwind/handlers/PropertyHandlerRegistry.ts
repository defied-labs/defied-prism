import type {
  PropertyHandler,
  HandlerContext,
  CompilableNode,
} from "./PropertyHandler";

import { layoutHandlers } from "./LayoutHandlers";
import { sizingHandlers } from "./SizingHandlers";
import { spacingHandlers } from "./SpacingHandlers";
import { borderHandlers } from "./BorderHandlers";
import { backgroundHandlers } from "./BackgroundHandlers";
import { typographyHandlers } from "./TypographyHandlers";
import { transformHandlers } from "./TransformHandlers";
import { filterHandlers } from "./FilterHandlers";
import { interactivityHandlers } from "./InteractivityHandlers";

export class PropertyHandlerRegistry {
  private handlers: PropertyHandler[] = [];

  constructor() {
    this.registerAll();
  }

  private registerAll(): void {
    this.handlers.push(
      ...layoutHandlers,
      ...sizingHandlers,
      ...spacingHandlers,
      ...borderHandlers,
      ...backgroundHandlers,
      ...typographyHandlers,
      ...transformHandlers,
      ...filterHandlers,
      ...interactivityHandlers,
    );
  }

  register(handler: PropertyHandler): void {
    this.handlers.push(handler);
  }

  getHandler(property: string): PropertyHandler | undefined {
    return this.handlers.find((h) => h.canHandle(property));
  }

  compileProperty(node: CompilableNode, context: HandlerContext): string[] {
    // Handle variant nodes specially
    if (node && typeof node === "object" && node.type === "variant") {
      const prefix = context.tailwindPrefixFor(node.name);
      if (!prefix) return [];
      const inner = context.compileNodes(node.styles ?? []);
      return inner.map((cls) => `${prefix}${cls}`);
    }

    const handler = this.getHandler(node.property);
    if (handler) {
      return handler.compile(node, context) as string[];
    }
    return [];
  }
}

// Singleton instance
export const propertyHandlerRegistry = new PropertyHandlerRegistry();
