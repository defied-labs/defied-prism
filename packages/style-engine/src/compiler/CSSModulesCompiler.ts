import type { Compiler } from "./Compiler";
import type { ParsedStyle } from "../parser/StyleParser";
import { isPseudoClass, isPseudoElement } from "../parser/StyleParser";
import { lengthToCss, type Length } from "../dsl/units";
import type { VariantNode } from "../types";

export interface CompileDiagnostic {
  level: "warn" | "error";
  code: string;
  message: string;
  token?: string;
}

export interface CompileFileResult {
  css: string;
  diagnostics: CompileDiagnostic[];
  missingTokens: string[];
}

const RADIUS_REM: Record<string, number> = {
  sm: 0.125,
  md: 0.375,
  lg: 0.5,
  full: 9999,
};

const COLOR_FALLBACK: Record<string, string> = {
  "slate-900": "#0f172a",
  "slate-100": "#f1f5f9",
  white: "#ffffff",
  "slate-500": "#64748b",
};

function spacingCss(value: unknown): string {
  return lengthToCss(value as Length);
}

function radiusValue(value: unknown): string {
  if (typeof value === "string" && value in RADIUS_REM) {
    return `${RADIUS_REM[value]}rem`;
  }

  return `var(--radius-${value})`;
}

interface ColorResolution {
  declaration: string;
  missingToken?: string;
}

function colorValue(value: unknown): ColorResolution {
  const key = String(value);

  if (key.includes("-")) {
    const fallback = COLOR_FALLBACK[key];
    if (fallback) {
      return { declaration: fallback };
    }

    return {
      declaration: `var(--color-${key})`,
      missingToken: `--color-${key}`,
    };
  }

  return {
    declaration: `var(--color-${key})`,
    missingToken: `--color-${key}`,
  };
}

export class CSSModulesCompiler implements Compiler {
  compile(style: ParsedStyle): string {
    const result = this.compileFile(style);
    if (typeof result.css !== "string") {
      throw new Error(
        "[prism] CSSModulesCompiler internal error: css output must be a string",
      );
    }
    return result.css;
  }

  compileFile(style: ParsedStyle): CompileFileResult {
    const missingTokens = new Set<string>();
    const diagnostics: CompileDiagnostic[] = [];

    const baseDeclarations = this.compileNodes(
      style.base,
      missingTokens,
    ).filter(Boolean);
    const variantEntries = Object.entries(style.variants);
    const blocks: string[] = [];

    if (baseDeclarations.length > 0) {
      blocks.push(`.root {\n  ${baseDeclarations.join("\n  ")}\n}`);
    }

    for (const [name, nodes] of variantEntries) {
      const propertyNodes: any[] = [];
      const nestedVariantNodes: VariantNode[] = [];
      for (const node of nodes) {
        if (node && typeof node === "object" && node.type === "variant") {
          nestedVariantNodes.push(node as VariantNode);
        } else {
          propertyNodes.push(node);
        }
      }

      const isElement = isPseudoElement(name);
      const declarations = this.compileNodes(
        propertyNodes,
        missingTokens,
      ).filter(Boolean);
      const selector = this.selectorFor(name);

      if (isElement && !declarations.some((d) => d.startsWith("content:"))) {
        declarations.unshift('content: "";');
      }

      if (declarations.length > 0 || isElement) {
        blocks.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);
      }

      // Emit one block per nested pseudo variant, scoped to the parent
      // variant's selector (e.g. `.root[data-variant="secondary"]:hover`).
      for (const nested of nestedVariantNodes) {
        const nestedDecls = this.compileNodes(
          nested.styles,
          missingTokens,
        ).filter(Boolean);
        const nestedIsElement = isPseudoElement(nested.name);
        if (
          nestedIsElement &&
          !nestedDecls.some((d) => d.startsWith("content:"))
        ) {
          nestedDecls.unshift('content: "";');
        }
        if (nestedDecls.length === 0 && !nestedIsElement) continue;
        const compound = `${selector}${nested.name}`;
        blocks.push(`${compound} {\n  ${nestedDecls.join("\n  ")}\n}`);
      }
    }

    for (const token of missingTokens) {
      diagnostics.push({
        level: "warn",
        code: "missing-token",
        message:
          `Design token "${token}" is not defined. Emitted \`var(${token})\`; ` +
          `define it in your CSS theme or the component will render unstyled.`,
        token,
      });
    }

    const finalResult = {
      css: blocks.join("\n\n") + "\n",
      diagnostics,
      missingTokens: Array.from(missingTokens),
    };

    // Validate output structure
    if (typeof finalResult.css !== "string") {
      throw new Error(
        "[prism] CSSModulesCompiler internal error: css output must be a string",
      );
    }
    if (!Array.isArray(finalResult.diagnostics)) {
      throw new Error(
        "[prism] CSSModulesCompiler internal error: diagnostics must be an array",
      );
    }
    if (!Array.isArray(finalResult.missingTokens)) {
      throw new Error(
        "[prism] CSSModulesCompiler internal error: missingTokens must be an array",
      );
    }

    return finalResult;
  }

  private compileNodes(nodes: any[], missingTokens?: Set<string>): string[] {
    return nodes.flatMap((node) => {
      switch (node.property) {
        case "display":
          return [`display: ${node.value};`];

        case "alignItems":
          return [`align-items: ${node.value};`];

        case "justifyContent":
          return [`justify-content: ${node.value};`];

        case "borderRadius":
          return [`border-radius: ${radiusValue(node.value)};`];

        case "background": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`background: ${resolved.declaration};`];
        }

        case "color": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`color: ${resolved.declaration};`];
        }

        case "content":
          return [`content: ${formatContent(node.value)};`];

        case "paddingX":
          return [
            `padding-left: ${spacingCss(node.value)};`,
            `padding-right: ${spacingCss(node.value)};`,
          ];

        case "paddingY":
          return [
            `padding-top: ${spacingCss(node.value)};`,
            `padding-bottom: ${spacingCss(node.value)};`,
          ];

        default:
          return [];
      }
    });
  }

  /**
   * Builds the CSS selector for a given variant name.
   *
   * - Design variants: `.root[data-variant="<name>"]`.
   * - Pseudo-classes:  `.root<state>`   — e.g. `.root:hover`, `.root:focus-visible`.
   * - Pseudo-elements: `.root::<name>`  — e.g. `.root::before`, `.root::after`.
   *   Pseudo-element blocks always get an explicit `content: ""` so the
   *   box is rendered even if the user only set positioning styles.
   */
  private selectorFor(name: string): string {
    if (isPseudoElement(name)) {
      return `.root${name}`;
    }
    if (isPseudoClass(name)) {
      return `.root${name}`;
    }
    return `.root[data-variant="${name}"]`;
  }
}

function formatContent(value: unknown): string {
  if (typeof value === "string" && value.startsWith('"')) {
    return value;
  }
  return `"${String(value ?? "")}"`;
}
