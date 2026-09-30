import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  compileMarginToTailwind,
  compilePaddingToTailwind,
} from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class MarginHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "margin",
      "marginX",
      "marginY",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileMarginToTailwind(node.property, node.value);
  }
}

export class PaddingHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "padding",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compilePaddingToTailwind(node.property, node.value);
  }
}

export class PaddingXHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "paddingX";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`px-${lengthToTailwindScale(node.value, "paddingX")}`];
  }
}

export class PaddingYHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "paddingY";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`py-${lengthToTailwindScale(node.value, "paddingY")}`];
  }
}

export const spacingHandlers: PropertyHandler[] = [
  new MarginHandler(),
  new PaddingHandler(),
  new PaddingXHandler(),
  new PaddingYHandler(),
];
