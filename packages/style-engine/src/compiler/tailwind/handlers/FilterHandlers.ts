import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import { lengthToTailwindScale } from "../../../dsl/units";

export class FilterHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "filter";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`filter`, `${String(node.value)}`];
  }
}

export class BackdropFilterHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "backdropBlur",
      "backdropBrightness",
      "backdropContrast",
      "backdropFilter",
      "backdropGrayscale",
      "backdropHueRotate",
      "backdropInvert",
      "backdropOpacity",
      "backdropSaturate",
      "backdropSepia",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "backdropBlur":
        if (node.value === "none") return ["backdrop-blur-none"];
        return [
          `backdrop-blur-${lengthToTailwindScale(node.value, "backdropBlur")}`,
        ];
      default:
        // All other backdrop filters currently return empty in original
        return [];
    }
  }
}

export const filterHandlers: PropertyHandler[] = [
  new FilterHandler(),
  new BackdropFilterHandler(),
];
