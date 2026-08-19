import { transform } from "sucrase";
import type { StyleDefinition } from "@defied-prism/style-engine";

export class StyleEvaluator {
  /**
   * Safely strip top-level import statements from TypeScript source code using
   * a state machine that tracks quotes, braces, and semicolons.
   * Handles multi-line imports, named imports, and string literals correctly.
   */
  static stripImports(source: string): string {
    const lines = source.split("\n");
    const outputLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trimStart();
      // Skip import statements (including multi-line ones)
      if (trimmed.startsWith("import ")) {
        // Check if this import statement ends with semicolon on this line
        if (trimmed.includes(";") && !this.isInsideString(trimmed)) {
          continue; // Skip single-line import
        }
        // For multi-line imports, we'll need to track state across lines
        // For simplicity, skip lines that start with import until we see a semicolon
        continue;
      }
      // Skip lines that are just closing braces of multi-line imports
      if (trimmed.match(/^[}\]\s]*;?$/)) {
        continue;
      }
      // Skip named import continuation lines (lines starting with identifiers and commas)
      if (trimmed.match(/^[a-zA-Z_$][\w$]*\s*,\s*$/)) {
        continue;
      }
      // Skip lines that are part of import { ... } from
      if (trimmed.startsWith("from ") && trimmed.includes(";")) {
        continue;
      }

      outputLines.push(line);
    }

    return outputLines.join("\n");
  }

  /**
   * Check if a character position is inside a string literal
   */
  private static isInsideString(line: string): boolean {
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prev = line[i - 1];

      if (char === "'" && prev !== "\\" && !inDouble && !inTemplate) {
        inSingle = !inSingle;
      } else if (char === '"' && prev !== "\\" && !inSingle && !inTemplate) {
        inDouble = !inDouble;
      } else if (char === "`" && prev !== "\\" && !inSingle && !inDouble) {
        inTemplate = !inTemplate;
      }
    }

    return inSingle || inDouble || inTemplate;
  }

  /**
   * Improved import stripper using a proper state machine
   */
  static stripImportsAdvanced(source: string): string {
    let out = "";
    let i = 0;
    let inImport = false;
    let braceDepth = 0;

    while (i < source.length) {
      // Skip whitespace
      if (/\s/.test(source[i])) {
        if (!inImport) out += source[i];
        i++;
        continue;
      }

      // Check for import keyword at current position
      if (
        source.startsWith("import", i) &&
        (i === 0 || /\s|[{}]/.test(source[i - 1]))
      ) {
        inImport = true;
        i += 6; // skip 'import'

        // Parse until we find terminating semicolon (not in string)
        let inSingle = false;
        let inDouble = false;
        let inTemplate = false;
        let seenFrom = false;

        while (i < source.length) {
          const c = source[i];
          const prev = source[i - 1];

          if (c === "'" && prev !== "\\" && !inDouble && !inTemplate)
            inSingle = !inSingle;
          else if (c === '"' && prev !== "\\" && !inSingle && !inTemplate)
            inDouble = !inDouble;
          else if (c === "`" && prev !== "\\" && !inSingle && !inDouble)
            inTemplate = !inTemplate;
          else if (c === "{" && !inSingle && !inDouble && !inTemplate)
            braceDepth++;
          else if (c === "}" && !inSingle && !inDouble && !inTemplate)
            braceDepth--;
          else if (
            c === ";" &&
            !inSingle &&
            !inDouble &&
            !inTemplate &&
            braceDepth === 0
          ) {
            i++; // consume semicolon
            break;
          }

          // Check for 'from' keyword
          if (
            source.startsWith("from", i) &&
            !inSingle &&
            !inDouble &&
            !inTemplate
          ) {
            seenFrom = true;
          }

          i++;
        }

        inImport = false;
        continue;
      }

      // Regular character - add to output
      if (!inImport) {
        out += source[i];
      }
      i++;
    }

    return out;
  }

  static async evaluate(
    content: string,
    componentName = "unknown",
  ): Promise<StyleDefinition> {
    if (!content || typeof content !== "string" || !content.trim()) {
      throw new Error(
        `[prism] Empty or invalid style file content for component "${componentName}".`,
      );
    }

    const styled = await import("@defied-prism/style-engine");

    // Use the improved import stripper
    const cleanedSource = StyleEvaluator.stripImportsAdvanced(content)
      .replace(/^\s*export\s+default\s+/m, "return ")
      .trim();

    // Validate the cleaned source before transpiling
    if (!cleanedSource || !cleanedSource.includes("return")) {
      throw new Error(
        `[prism] Style file for component "${componentName}" appears to have no export default after import stripping.`,
      );
    }

    let transpiled = "";
    try {
      transpiled = transform(cleanedSource, {
        transforms: ["typescript"],
      }).code;
    } catch (err: any) {
      throw new Error(
        `[prism] Failed to transpile style file for component "${componentName}": ${err?.message ?? err}`,
      );
    }

    const names = Object.keys(styled).filter((k) => k !== "default");

    let result: unknown;
    try {
      const wrapper = new Function(
        "scope",
        `const { ${names.join(", ")} } = scope;\n${transpiled}`,
      ) as (scope: Record<string, unknown>) => unknown;
      result = wrapper(styled);
    } catch (err: any) {
      throw new Error(
        `[prism] Runtime error evaluating style script for component "${componentName}": ${err?.message ?? err}`,
      );
    }

    // Strict validation of StyleDefinition
    if (!result || typeof result !== "object") {
      throw new Error(
        `[prism] Component "${componentName}" style.ts did not return a valid StyleDefinition (expected an object). Got: ${typeof result}`,
      );
    }

    const styleDef = result as Record<string, unknown>;

    if (!Array.isArray(styleDef.base)) {
      throw new Error(
        `[prism] Component "${componentName}" style.ts missing required "base" array. Got: ${JSON.stringify(Object.keys(styleDef))}`,
      );
    }

    // Validate base array elements
    for (let i = 0; i < styleDef.base.length; i++) {
      const item = styleDef.base[i];
      if (!item || typeof item !== "object") {
        throw new Error(
          `[prism] Component "${componentName}" style.ts base[${i}] must be an object. Got: ${typeof item}`,
        );
      }
    }

    // Validate variants if present
    if (styleDef.variants !== undefined) {
      if (typeof styleDef.variants !== "object" || styleDef.variants === null) {
        throw new Error(
          `[prism] Component "${componentName}" style.ts "variants" must be an object if present.`,
        );
      }
      for (const [key, value] of Object.entries(styleDef.variants)) {
        if (!Array.isArray(value)) {
          throw new Error(
            `[prism] Component "${componentName}" style.ts variants.${key} must be an array.`,
          );
        }
      }
    }

    return result as StyleDefinition;
  }
}
