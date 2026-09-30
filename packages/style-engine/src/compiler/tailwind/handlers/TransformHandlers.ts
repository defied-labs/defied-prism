import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  compileTransformToTailwind,
  compileTransitionToTailwind,
} from "../tailwind-maps";
import { lengthToTailwindScale } from "../../../dsl/units";

export class TransformHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "transform",
      "transformOrigin",
      "scale",
      "scaleX",
      "scaleY",
      "rotate",
      "translateX",
      "translateY",
      "skewX",
      "skewY",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "transform":
        return compileTransformToTailwind(String(node.value));
      case "transformOrigin":
        return [`origin-${node.value}`];
      case "scale":
        return ["transform", `scale-${node.value}`];
      case "scaleX":
        return ["transform", `scale-x-${node.value}`];
      case "scaleY":
        return ["transform", `scale-y-${node.value}`];
      case "rotate":
        return ["transform", `rotate-${node.value}`];
      case "translateX":
        return [
          "transform",
          `translate-x-${lengthToTailwindScale(node.value, "translateX")}`,
        ];
      case "translateY":
        return [
          "transform",
          `translate-y-${lengthToTailwindScale(node.value, "translateY")}`,
        ];
      case "skewX":
        return ["transform", `skew-x-${node.value}`];
      case "skewY":
        return ["transform", `skew-y-${node.value}`];
      default:
        return [];
    }
  }
}

export class TransitionHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "transition";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (typeof node.value === "object" && node.value !== null) {
      return compileTransitionToTailwind(node.value);
    }
    return [`transition-${node.value}`];
  }
}

export class TransitionPropertyHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "animationDuration",
      "animationDelay",
      "animationIterationCount",
      "animationDirection",
      "animationFillMode",
      "animationPlayState",
      "animationTimingFunction",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "animationDuration":
        return [
          `animate-${lengthToTailwindScale(node.value, "animationDuration")}`,
        ];
      case "animationDelay":
        return [
          `animate-delay-${lengthToTailwindScale(node.value, "animationDelay")}`,
        ];
      case "animationIterationCount":
        if (node.value === "infinite")
          return ["animate-[animation-iteration-count:infinite]"];
        return [];
      case "animationDirection":
      case "animationFillMode":
        return [];
      case "animationPlayState":
        if (node.value === "paused") return ["animate-paused"];
        if (node.value === "running") return ["animate-running"];
        return [];
      case "animationTimingFunction":
        // This is mapped to lineHeight in the original, likely a bug, but preserving behavior
        const { compileLineHeightToTailwind } = require("../tailwind-maps");
        return compileLineHeightToTailwind(node.value);
      default:
        return [];
    }
  }
}

export class AnimationHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "animation";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`animate-[${node.value}]`];
  }
}

export const transformHandlers: PropertyHandler[] = [
  new TransformHandler(),
  new TransitionHandler(),
  new TransitionPropertyHandler(),
  new AnimationHandler(),
];
