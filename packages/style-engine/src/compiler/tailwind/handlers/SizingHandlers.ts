import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  compileWidthToTailwind,
  compileHeightToTailwind,
  MAX_WIDTH_MAP,
} from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class WidthHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "width";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileWidthToTailwind(node.value);
  }
}

export class HeightHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "height";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileHeightToTailwind(node.value);
  }
}

export class MinWidthHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "minWidth";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`min-w-${lengthToTailwindScale(node.value, "minWidth")}`];
  }
}

export class MaxWidthHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "maxWidth";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = MAX_WIDTH_MAP[String(node.value)];
    return result ? [result] : [`max-w-[${node.value}]`];
  }
}

export class MinHeightHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "minHeight";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`min-h-${lengthToTailwindScale(node.value, "minHeight")}`];
  }
}

export class MaxHeightHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "maxHeight";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`max-h-${lengthToTailwindScale(node.value, "maxHeight")}`];
  }
}

export const sizingHandlers: PropertyHandler[] = [
  new WidthHandler(),
  new HeightHandler(),
  new MinWidthHandler(),
  new MaxWidthHandler(),
  new MinHeightHandler(),
  new MaxHeightHandler(),
];
