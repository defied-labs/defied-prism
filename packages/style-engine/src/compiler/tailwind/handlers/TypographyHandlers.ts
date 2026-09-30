import type { PropertyHandler, HandlerContext } from "./PropertyHandler";
import {
  compileFontSizeToTailwind,
  compileFontWeightToTailwind,
  compileTextAlignToTailwind,
  compileLineHeightToTailwind,
  LETTER_SPACING_MAP,
  TEXT_DECORATION_MAP,
  TEXT_TRANSFORM_MAP,
  WHITE_SPACE_MAP,
  WORD_BREAK_MAP,
} from "../tailwind-maps";

export class ColorHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "color";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const value = String(node.value);
    if (value.startsWith("color-")) {
      return [`text-[var(--${value})]`];
    }
    return [`text-${value}`];
  }
}

export class FontSizeHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "fontSize";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileFontSizeToTailwind(node.value);
  }
}

export class FontWeightHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "fontWeight";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileFontWeightToTailwind(node.value);
  }
}

export class FontFamilyHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "fontFamily";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return [`font-[${node.value}]`];
  }
}

export class FontStyleHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "fontStyle";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (node.value === "italic" || node.value === "oblique") return ["italic"];
    return ["not-italic"];
  }
}

export class LineHeightHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "lineHeight";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileLineHeightToTailwind(node.value);
  }
}

export class LetterSpacingHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "letterSpacing";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = LETTER_SPACING_MAP[node.value];
    return result ? [result] : [`tracking-[${node.value}]`];
  }
}

export class TextAlignHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "textAlign";
  }

  compile(node: any, _context: HandlerContext): string[] {
    return compileTextAlignToTailwind(String(node.value));
  }
}

export class TextDecorationHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "textDecoration";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = TEXT_DECORATION_MAP[node.value];
    return result ? [result] : [];
  }
}

export class TextTransformHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "textTransform";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = TEXT_TRANSFORM_MAP[node.value];
    return result ? [result] : [];
  }
}

export class TextOverflowHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "textOverflow";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (node.value === "ellipsis") return ["truncate"];
    if (node.value === "clip") return ["text-clip"];
    return [];
  }
}

export class WhiteSpaceHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "whiteSpace";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = WHITE_SPACE_MAP[node.value];
    return result ? [result] : [];
  }
}

export class WordBreakHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "wordBreak";
  }

  compile(node: any, _context: HandlerContext): string[] {
    const result = WORD_BREAK_MAP[node.value];
    return result ? [result] : [];
  }
}

export class OverflowWrapHandler implements PropertyHandler {
  canHandle(property: string): boolean {
    return property === "overflowWrap";
  }

  compile(node: any, _context: HandlerContext): string[] {
    if (node.value === "break-word") return ["break-words"];
    if (node.value === "anywhere") return ["break-all"];
    return [];
  }
}

export const typographyHandlers: PropertyHandler[] = [
  new ColorHandler(),
  new FontSizeHandler(),
  new FontWeightHandler(),
  new FontFamilyHandler(),
  new FontStyleHandler(),
  new LineHeightHandler(),
  new LetterSpacingHandler(),
  new TextAlignHandler(),
  new TextDecorationHandler(),
  new TextTransformHandler(),
  new TextOverflowHandler(),
  new WhiteSpaceHandler(),
  new WordBreakHandler(),
  new OverflowWrapHandler(),
];
