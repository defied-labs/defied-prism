import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  compileCursorToTailwind,
  compileOpacityToTailwind,
} from "../tailwind-maps";
import { USER_SELECT_MAP, RESIZE_MAP } from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class CursorHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "cursor";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileCursorToTailwind(String(node.value));
  }
}

export class PointerEventsHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "pointerEvents";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`pointer-events-${node.value}`];
  }
}

export class UserSelectHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "userSelect";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = USER_SELECT_MAP[node.value];
    return result ? [result] : [];
  }
}

export class ResizeHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "resize";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = RESIZE_MAP[node.value];
    return result ? [result] : [];
  }
}

export class ScrollMarginHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "scrollMargin";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`scroll-m-${lengthToTailwindScale(node.value, "scrollMargin")}`];
  }
}

export class ScrollPaddingHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "scrollPadding";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`scroll-p-${lengthToTailwindScale(node.value, "scrollPadding")}`];
  }
}

export class AccentColorHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "accentColor";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`accent-${node.value}`];
  }
}

export class AppearanceHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "appearance";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (node.value === "none") return ["appearance-none"];
    return [];
  }
}

export class OpacityHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "opacity";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileOpacityToTailwind(node.value);
  }
}

export class ContentHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "content";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`content-['${String(node.value ?? "").replace(/^"|"$/g, "")}']`];
  }
}

export const interactivityHandlers: PropertyHandler[] = [
  new CursorHandler(),
  new PointerEventsHandler(),
  new UserSelectHandler(),
  new ResizeHandler(),
  new ScrollMarginHandler(),
  new ScrollPaddingHandler(),
  new AccentColorHandler(),
  new AppearanceHandler(),
  new OpacityHandler(),
  new ContentHandler(),
];
