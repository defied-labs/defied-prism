import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import { compileBorderToTailwind, BORDER_RADIUS_MAP } from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class BorderHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "border",
      "borderX",
      "borderY",
      "borderTop",
      "borderRight",
      "borderBottom",
      "borderLeft",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileBorderToTailwind(node.property, String(node.value));
  }
}

export class BorderWidthHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "borderWidth";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`border-${lengthToTailwindScale(node.value, "borderWidth")}`];
  }
}

export class BorderColorHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "borderColor";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`border-${node.value}`];
  }
}

export class BorderStyleHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "borderStyle";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`border-${node.value}`];
  }
}

export class BorderRadiusHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "borderRadius";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = BORDER_RADIUS_MAP[node.value];
    return result ? [result] : [];
  }
}

export class OutlineHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "outline",
      "outlineWidth",
      "outlineColor",
      "outlineStyle",
      "outlineOffset",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "outline":
        if (node.value === "none") return ["outline-none"];
        return ["outline"];
      case "outlineWidth":
        return [`outline-${lengthToTailwindScale(node.value, "outlineWidth")}`];
      case "outlineColor":
        return [`outline-${node.value}`];
      case "outlineStyle":
        return [`outline-${node.value}`];
      case "outlineOffset":
        return [
          `outline-offset-${lengthToTailwindScale(node.value, "outlineOffset")}`,
        ];
      default:
        return [];
    }
  }
}

export class RingHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "ring",
      "ringColor",
      "ringOffset",
      "ringOffsetColor",
      "ringInset",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "ring":
        return [`ring-${lengthToTailwindScale(node.value, "ring")}`];
      case "ringColor":
        return [`ring-${node.value}`];
      case "ringOffset":
        return [
          `ring-offset-${lengthToTailwindScale(node.value, "ringOffset")}`,
        ];
      case "ringOffsetColor":
        return [`ring-offset-${node.value}`];
      case "ringInset":
        return ["ring-inset"];
      default:
        return [];
    }
  }
}

export const borderHandlers: PropertyHandler[] = [
  new BorderHandler(),
  new BorderWidthHandler(),
  new BorderColorHandler(),
  new BorderStyleHandler(),
  new BorderRadiusHandler(),
  new OutlineHandler(),
  new RingHandler(),
];
