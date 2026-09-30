import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import { compilePositionToTailwind } from "../tailwind-maps";
import { DISPLAY_MAP } from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class DisplayHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "display";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = DISPLAY_MAP[node.value];
    return result ? [result] : [];
  }
}

export class PositionHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "position";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compilePositionToTailwind(String(node.value));
  }
}

export class InsetHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return ["inset", "top", "right", "bottom", "left"].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    const property = node.property;
    if (node.value === "auto") return [`${property}-auto`];

    const scaleMap: Record<string, string> = {
      inset: "inset",
      top: "top",
      right: "right",
      bottom: "bottom",
      left: "left",
    };
    return [
      `${property}-${lengthToTailwindScale(node.value, scaleMap[property])}`,
    ];
  }
}

export class ZIndexHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "zIndex";
  }

  async compile(node: any): Promise<string[]> {
    const { compileZIndexToTailwind } = await import("../tailwind-maps");
    return compileZIndexToTailwind(node.value);
  }
}

export class VisibilityHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "visibility";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (node.value === "hidden") return ["invisible"];
    if (node.value === "collapse") return ["collapse"];
    return ["visible"];
  }
}

export class OverflowHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "overflow";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`overflow-${node.value}`];
  }
}

export class FlexboxHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "flexDirection",
      "flexWrap",
      "flexGrow",
      "flexShrink",
      "flexBasis",
      "flex",
      "alignItems",
      "justifyContent",
      "gap",
      "order",
    ].includes(property);
  }

  compile(node: any): string[] {
    switch (node.property) {
      case "flexDirection":
        return [`flex-${node.value}`];
      case "flexWrap":
        return [`flex-${node.value}`];
      case "flexGrow":
        if (node.value === 0) return ["flex-grow-0"];
        if (["initial", "inherit", "unset"].includes(node.value)) return [];
        return ["flex-grow"];
      case "flexShrink":
        if (node.value === 0) return ["flex-shrink-0"];
        if (["initial", "inherit", "unset"].includes(node.value)) return [];
        return ["flex-shrink"];
      case "flexBasis":
        return [`basis-${lengthToTailwindScale(node.value, "flexBasis")}`];
      case "flex":
        return [`flex-${node.value}`];
      case "alignItems":
        if (node.value === "center") return ["items-center"];
        return [];
      case "justifyContent":
        if (node.value === "center") return ["justify-center"];
        return [];
      case "gap":
        return [`gap-${lengthToTailwindScale(node.value, "gap")}`];
      case "order":
        if (node.value === "first") return ["order-first"];
        if (node.value === "last") return ["order-last"];
        if (node.value === "none") return ["order-none"];
        return [`order-${node.value}`];
      default:
        return [];
    }
  }
}

export class GridHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "gridTemplateColumns",
      "gridTemplateRows",
      "gridColumn",
      "gridRow",
      "gridAutoFlow",
      "gridAutoColumns",
      "gridAutoRows",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    const map: Record<string, string> = {
      gridTemplateColumns: "grid-cols",
      gridTemplateRows: "grid-rows",
      gridColumn: "col",
      gridRow: "row",
      gridAutoFlow: "grid-flow",
      gridAutoColumns: "auto-cols",
      gridAutoRows: "auto-rows",
    };
    const prefix = map[node.property];
    return prefix ? [`${prefix}-${node.value}`] : [];
  }
}

export const layoutHandlers: PropertyHandler[] = [
  new DisplayHandler(),
  new PositionHandler(),
  new InsetHandler(),
  new ZIndexHandler(),
  new VisibilityHandler(),
  new OverflowHandler(),
  new FlexboxHandler(),
  new GridHandler(),
];
