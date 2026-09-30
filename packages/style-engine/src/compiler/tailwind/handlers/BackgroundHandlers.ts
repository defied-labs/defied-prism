import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  BACKGROUND_SIZE_MAP,
  BACKGROUND_REPEAT_MAP,
  BACKGROUND_ATTACHMENT_MAP,
  BACKGROUND_CLIP_MAP,
  BACKGROUND_ORIGIN_MAP,
  compileShadowToTailwind,
} from "../tailwind-maps";

export class BackgroundHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return [
      "background",
      "backgroundColor",
      "backgroundImage",
      "backgroundPosition",
      "backgroundSize",
      "backgroundRepeat",
      "backgroundAttachment",
      "backgroundClip",
      "backgroundOrigin",
    ].includes(property);
  }

  compile(node: any, _context: HandlerContext): string[] {
    switch (node.property) {
      case "background":
      case "backgroundColor": {
        const value = String(node.value);
        if (value.startsWith("color-")) {
          return [`bg-[var(--${value})]`];
        }
        return [`bg-${value}`];
      }
      case "backgroundImage":
        if (
          typeof node.value === "string" &&
          node.value.startsWith("gradient")
        ) {
          return [`bg-gradient-to-${node.value.replace("gradient-", "")}`];
        }
        return [`bg-[${node.value}]`];
      case "backgroundPosition":
        return [`bg-${node.value}`];
      case "backgroundSize":
        return this.compileBackgroundSize(node.value);
      case "backgroundRepeat":
        return this.compileBackgroundRepeat(node.value);
      case "backgroundAttachment":
        return this.compileBackgroundAttachment(node.value);
      case "backgroundClip":
        return this.compileBackgroundClip(node.value);
      case "backgroundOrigin":
        return this.compileBackgroundOrigin(node.value);
      default:
        return [];
    }
  }

  private compileBackgroundSize(value: string): string[] {
    const result = BACKGROUND_SIZE_MAP[value];
    return result ? [result] : [`bg-[${value}]`];
  }

  private compileBackgroundRepeat(value: string): string[] {
    const result = BACKGROUND_REPEAT_MAP[value];
    return result ? [result] : [];
  }

  private compileBackgroundAttachment(value: string): string[] {
    const result = BACKGROUND_ATTACHMENT_MAP[value];
    return result ? [result] : [];
  }

  private compileBackgroundClip(value: string): string[] {
    const result = BACKGROUND_CLIP_MAP[value];
    return result ? [result] : [];
  }

  private compileBackgroundOrigin(value: string): string[] {
    const result = BACKGROUND_ORIGIN_MAP[value];
    return result ? [result] : [];
  }
}

export class ShadowHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "boxShadow";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileShadowToTailwind(String(node.value));
  }
}

export const backgroundHandlers: PropertyHandler[] = [
  new BackgroundHandler(),
  new ShadowHandler(),
];
