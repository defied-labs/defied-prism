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

        // New properties
        case "boxShadow": {
          const key = String(node.value);
          if (key.includes("-")) {
            const shadowMap: Record<string, string> = {
              sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
              none: "none",
            };
            if (shadowMap[key]) {
              return [`box-shadow: ${shadowMap[key]};`];
            }
            return [`box-shadow: var(--shadow-${key});`];
          }
          return [`box-shadow: var(--shadow-${key});`];
        }

        case "transform":
          return [`transform: var(--transform-${node.value});`];

        case "zIndex":
          return [`z-index: ${node.value};`];

        case "filter":
          return [`filter: var(--filter-${node.value});`];

        case "opacity":
          return [
            `opacity: ${typeof node.value === "number" && node.value <= 1 ? node.value : node.value / 100};`,
          ];

        case "overflow":
          return [`overflow: ${node.value};`];

        case "cursor":
          return [`cursor: ${node.value};`];

        case "pointerEvents":
          return [`pointer-events: ${node.value};`];

        case "userSelect":
          return [`user-select: ${node.value};`];

        case "position":
          return [`position: ${node.value};`];

        case "inset":
          if (node.value === "auto") return ["inset: auto;"];
          return [
            `top: ${spacingCss(node.value)};`,
            `right: ${spacingCss(node.value)};`,
            `bottom: ${spacingCss(node.value)};`,
            `left: ${spacingCss(node.value)};`,
          ];

        case "top":
          if (node.value === "auto") return ["top: auto;"];
          return [`top: ${spacingCss(node.value)};`];

        case "right":
          if (node.value === "auto") return ["right: auto;"];
          return [`right: ${spacingCss(node.value)};`];

        case "bottom":
          if (node.value === "auto") return ["bottom: auto;"];
          return [`bottom: ${spacingCss(node.value)};`];

        case "left":
          if (node.value === "auto") return ["left: auto;"];
          return [`left: ${spacingCss(node.value)};`];

        case "width":
          return [`width: ${spacingCss(node.value)};`];

        case "height":
          return [`height: ${spacingCss(node.value)};`];

        case "minWidth":
          return [`min-width: ${spacingCss(node.value)};`];

        case "maxWidth":
          return [`max-width: ${spacingCss(node.value)};`];

        case "minHeight":
          return [`min-height: ${spacingCss(node.value)};`];

        case "maxHeight":
          return [`max-height: ${spacingCss(node.value)};`];

        case "margin": {
          const val = spacingCss(node.value);
          return [
            `margin-top: ${val};`,
            `margin-right: ${val};`,
            `margin-bottom: ${val};`,
            `margin-left: ${val};`,
          ];
        }

        case "marginX": {
          const val = spacingCss(node.value);
          return [`margin-left: ${val};`, `margin-right: ${val};`];
        }

        case "marginY": {
          const val = spacingCss(node.value);
          return [`margin-top: ${val};`, `margin-bottom: ${val};`];
        }

        case "marginTop":
          return [`margin-top: ${spacingCss(node.value)};`];

        case "marginRight":
          return [`margin-right: ${spacingCss(node.value)};`];

        case "marginBottom":
          return [`margin-bottom: ${spacingCss(node.value)};`];

        case "marginLeft":
          return [`margin-left: ${spacingCss(node.value)};`];

        case "padding": {
          const val = spacingCss(node.value);
          return [
            `padding-top: ${val};`,
            `padding-right: ${val};`,
            `padding-bottom: ${val};`,
            `padding-left: ${val};`,
          ];
        }

        case "paddingTop":
          return [`padding-top: ${spacingCss(node.value)};`];

        case "paddingRight":
          return [`padding-right: ${spacingCss(node.value)};`];

        case "paddingBottom":
          return [`padding-bottom: ${spacingCss(node.value)};`];

        case "paddingLeft":
          return [`padding-left: ${spacingCss(node.value)};`];

        case "border": {
          const val = String(node.value);
          if (val === "none" || val === "0") return ["border: none;"];
          return [
            `border-width: 1px;`,
            `border-style: solid;`,
            `border-color: var(--color-${val});`,
          ];
        }

        case "borderX":
          return [
            `border-left-width: 1px;`,
            `border-right-width: 1px;`,
            `border-style: solid;`,
            `border-color: var(--color-${node.value});`,
          ];

        case "borderY":
          return [
            `border-top-width: 1px;`,
            `border-bottom-width: 1px;`,
            `border-style: solid;`,
            `border-color: var(--color-${node.value});`,
          ];

        case "borderTop":
          return [
            `border-top-width: 1px;`,
            `border-top-style: solid;`,
            `border-top-color: var(--color-${node.value});`,
          ];

        case "borderRight":
          return [
            `border-right-width: 1px;`,
            `border-right-style: solid;`,
            `border-right-color: var(--color-${node.value});`,
          ];

        case "borderBottom":
          return [
            `border-bottom-width: 1px;`,
            `border-bottom-style: solid;`,
            `border-bottom-color: var(--color-${node.value});`,
          ];

        case "borderLeft":
          return [
            `border-left-width: 1px;`,
            `border-left-style: solid;`,
            `border-left-color: var(--color-${node.value});`,
          ];

        case "borderWidth":
          return [`border-width: ${spacingCss(node.value)};`];

        case "borderColor":
          return [`border-color: var(--color-${node.value});`];

        case "borderStyle":
          return [`border-style: ${node.value};`];

        case "outline":
          if (node.value === "none") return ["outline: none;"];
          return ["outline: 1px solid;"];

        case "outlineWidth":
          return [`outline-width: ${spacingCss(node.value)};`];

        case "outlineColor":
          return [`outline-color: var(--color-${node.value});`];

        case "outlineStyle":
          return [`outline-style: ${node.value};`];

        case "outlineOffset":
          return [`outline-offset: ${spacingCss(node.value)};`];

        case "ring":
          return [
            `--ring-width: ${spacingCss(node.value)};`,
            `box-shadow: 0 0 0 var(--ring-width) var(--ring-color, var(--color-primary));`,
          ];

        case "ringColor": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`--ring-color: ${resolved.declaration};`];
        }

        case "ringOffset":
          return [
            `--ring-offset-width: ${spacingCss(node.value)};`,
            `box-shadow: 0 0 0 var(--ring-width) var(--ring-color, var(--color-primary)), 0 0 0 var(--ring-offset-width) var(--ring-offset-color, white);`,
          ];

        case "ringOffsetColor": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`--ring-offset-color: ${resolved.declaration};`];
        }

        case "ringInset":
          return ["--ring-inset: inset;"];

        case "flexDirection":
          return [`flex-direction: ${node.value};`];

        case "flexWrap":
          return [`flex-wrap: ${node.value};`];

        case "flexGrow":
          if (node.value === 0) return ["flex-grow: 0;"];
          return ["flex-grow: 1;"];

        case "flexShrink":
          if (node.value === 0) return ["flex-shrink: 0;"];
          return ["flex-shrink: 1;"];

        case "flexBasis":
          return [`flex-basis: ${spacingCss(node.value)};`];

        case "flex":
          return [`flex: ${node.value};`];

        case "order":
          return [`order: ${node.value};`];

        case "gridTemplateColumns":
          return [`grid-template-columns: ${node.value};`];

        case "gridTemplateRows":
          return [`grid-template-rows: ${node.value};`];

        case "gridColumn":
          return [`grid-column: ${node.value};`];

        case "gridRow":
          return [`grid-row: ${node.value};`];

        case "gridAutoFlow":
          return [`grid-auto-flow: ${node.value};`];

        case "gridAutoColumns":
          return [`grid-auto-columns: ${node.value};`];

        case "gridAutoRows":
          return [`grid-auto-rows: ${node.value};`];

        case "fontSize":
          return [`font-size: ${spacingCss(node.value)};`];

        case "fontWeight":
          return [`font-weight: ${node.value};`];

        case "fontFamily":
          return [`font-family: ${node.value};`];

        case "fontStyle":
          return [`font-style: ${node.value};`];

        case "lineHeight":
          return [
            `line-height: ${typeof node.value === "number" ? node.value : spacingCss(node.value)};`,
          ];

        case "letterSpacing":
          return [`letter-spacing: ${spacingCss(node.value)};`];

        case "textAlign":
          return [`text-align: ${node.value};`];

        case "textDecoration":
          return [`text-decoration: ${node.value};`];

        case "textTransform": {
          const ttMap: Record<string, string> = {
            uppercase: "uppercase",
            lowercase: "lowercase",
            capitalize: "capitalize",
            "normal-case": "none",
          };
          return [`text-transform: ${ttMap[node.value] ?? "none"};`];
        }

        case "textOverflow":
          if (node.value === "ellipsis") {
            return [
              "overflow: hidden;",
              "text-overflow: ellipsis;",
              "white-space: nowrap;",
            ];
          }
          return [`text-overflow: ${node.value};`];

        case "whiteSpace":
          return [`white-space: ${node.value};`];

        case "wordBreak":
          return [`word-break: ${node.value};`];

        case "overflowWrap":
          return [`overflow-wrap: ${node.value};`];

        case "display":
          return [`display: ${node.value};`];

        case "visibility":
          if (node.value === "hidden") return ["visibility: hidden;"];
          if (node.value === "collapse") return ["visibility: collapse;"];
          return ["visibility: visible;"];

        case "backgroundColor": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`background-color: ${resolved.declaration};`];
        }

        case "backgroundImage":
          return [`background-image: ${node.value};`];

        case "backgroundPosition":
          return [`background-position: ${node.value};`];

        case "backgroundSize":
          const bsMap: Record<string, string> = {
            auto: "auto",
            cover: "cover",
            contain: "contain",
          };
          return [
            `background-size: ${bsMap[String(node.value)] ?? spacingCss(node.value)};`,
          ];

        case "backgroundRepeat":
          return [`background-repeat: ${node.value};`];

        case "backgroundAttachment":
          return [`background-attachment: ${node.value};`];

        case "backgroundClip": {
          const bcMap: Record<string, string> = {
            "border-box": "border-box",
            "padding-box": "padding-box",
            "content-box": "content-box",
            text: "text",
          };
          return [`background-clip: ${bcMap[node.value] ?? "border-box"};`];
        }

        case "backgroundOrigin": {
          const boMap: Record<string, string> = {
            "border-box": "border-box",
            "padding-box": "padding-box",
            "content-box": "content-box",
          };
          return [`background-origin: ${boMap[node.value] ?? "padding-box"};`];
        }

        case "animation":
          return [`animation: ${node.value};`];

        case "animationDuration":
          return [
            `animation-duration: ${typeof node.value === "string" ? node.value : `${node.value}ms`};`,
          ];

        case "animationDelay":
          return [
            `animation-delay: ${typeof node.value === "string" ? node.value : `${node.value}ms`};`,
          ];

        case "animationIterationCount":
          return [`animation-iteration-count: ${node.value};`];

        case "animationDirection":
          return [`animation-direction: ${node.value};`];

        case "animationFillMode":
          return [`animation-fill-mode: ${node.value};`];

        case "animationPlayState":
          return [`animation-play-state: ${node.value};`];

        case "animationTimingFunction":
          return [`animation-timing-function: ${node.value};`];

        case "transformOrigin":
          return [`transform-origin: ${node.value};`];

        case "scale":
          return [`transform: scale(${node.value});`];

        case "scaleX":
          return [`transform: scaleX(${node.value});`];

        case "scaleY":
          return [`transform: scaleY(${node.value});`];

        case "rotate":
          return [`transform: rotate(${node.value});`];

        case "translateX":
          return [`transform: translateX(${spacingCss(node.value)});`];

        case "translateY":
          return [`transform: translateY(${spacingCss(node.value)});`];

        case "skewX":
          return [`transform: skewX(${node.value});`];

        case "skewY":
          return [`transform: skewY(${node.value});`];

        case "backdropBlur":
          if (node.value === "none") return ["backdrop-filter: none;"];
          return [`backdrop-filter: blur(${spacingCss(node.value)});`];

        case "backdropBrightness":
          return [`backdrop-filter: brightness(${node.value});`];

        case "backdropContrast":
          return [`backdrop-filter: contrast(${node.value});`];

        case "backdropFilter":
          return [`backdrop-filter: ${node.value};`];

        case "backdropGrayscale":
          return [`backdrop-filter: grayscale(${node.value});`];

        case "backdropHueRotate":
          return [`backdrop-filter: hue-rotate(${node.value});`];

        case "backdropInvert":
          return [`backdrop-filter: invert(${node.value});`];

        case "backdropOpacity":
          return [`backdrop-filter: opacity(${node.value});`];

        case "backdropSaturate":
          return [`backdrop-filter: saturate(${node.value});`];

        case "backdropSepia":
          return [`backdrop-filter: sepia(${node.value});`];

        case "resize":
          return [`resize: ${node.value};`];

        case "scrollMargin":
          return [
            `scroll-margin-top: ${spacingCss(node.value)};`,
            `scroll-margin-right: ${spacingCss(node.value)};`,
            `scroll-margin-bottom: ${spacingCss(node.value)};`,
            `scroll-margin-left: ${spacingCss(node.value)};`,
          ];

        case "scrollPadding":
          return [
            `scroll-padding-top: ${spacingCss(node.value)};`,
            `scroll-padding-right: ${spacingCss(node.value)};`,
            `scroll-padding-bottom: ${spacingCss(node.value)};`,
            `scroll-padding-left: ${spacingCss(node.value)};`,
          ];

        case "accentColor": {
          const resolved = colorValue(node.value);
          if (resolved.missingToken && missingTokens) {
            missingTokens.add(resolved.missingToken);
          }
          return [`accent-color: ${resolved.declaration};`];
        }

        case "appearance":
          if (node.value === "none") return ["appearance: none;"];
          return [`appearance: ${node.value};`];

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
