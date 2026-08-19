import type { Compiler } from "./Compiler";
import type { ParsedStyle } from "../parser/StyleParser";
import { isPseudoClass, isPseudoElement } from "../parser/StyleParser";
import {
  durationToTailwindScale,
  easingToTailwind,
  lengthToTailwindScale,
  transitionPropertyToTailwind,
  type Easing,
  type Length,
} from "../dsl/units";
import type { TransitionOptions } from "../dsl/properties";

const TAILWIND_PSEUDO_PREFIX: Record<string, string> = {
  "::before": "before:",
  "::after": "after:",
  ":hover": "hover:",
  ":focus": "focus:",
  ":focus-visible": "focus-visible:",
  ":focus-within": "focus-within:",
  ":active": "active:",
  ":disabled": "disabled:",
  ":placeholder": "placeholder:",
  ":placeholder-shown": "placeholder-shown:",
  ":first-child": "first-child:",
  ":last-child": "last-child:",
  ":odd": "odd:",
  ":even": "even:",
};

function tailwindPrefixFor(name: string): string | null {
  if (isPseudoClass(name) || isPseudoElement(name)) {
    return TAILWIND_PSEUDO_PREFIX[name] ?? null;
  }
  return null;
}

export class TailwindCompiler implements Compiler {
  compile(style: ParsedStyle): string {
    const base = this.compileNodes(style.base).filter(Boolean).join(" ");

    // Validate output
    if (typeof base !== "string") {
      throw new Error(
        "[prism] TailwindCompiler internal error: base compilation returned non-string",
      );
    }

    return base;
  }

  compileVariants(style: ParsedStyle): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [name, nodes] of Object.entries(style.variants)) {
      const prefix = tailwindPrefixFor(name);
      const compiled = this.compileNodes(nodes).filter(Boolean).join(" ");

      if (compiled) {
        result[name] = prefix
          ? compiled
              .split(" ")
              .map((cls) => `${prefix}${cls}`)
              .join(" ")
          : compiled;
      }
    }

    // Validate output
    for (const [key, value] of Object.entries(result)) {
      if (typeof value !== "string") {
        throw new Error(
          `[prism] TailwindCompiler internal error: variant "${key}" compilation returned non-string`,
        );
      }
    }

    return result;
  }

  private compileNodes(nodes: any[]): string[] {
    return nodes.flatMap((node) => {
      if (node && typeof node === "object" && node.type === "variant") {
        const prefix = tailwindPrefixFor(node.name);
        if (!prefix) return [];
        const inner = this.compileNodes(node.styles ?? []).filter(Boolean);
        return inner.map((cls) => `${prefix}${cls}`);
      }
      switch (node.property) {
        case "display":
          if (node.value === "flex") return ["flex"];
          return [];

        case "alignItems":
          if (node.value === "center") return ["items-center"];
          return [];

        case "justifyContent":
          if (node.value === "center") return ["justify-center"];
          return [];

        case "borderRadius": {
          const radiusMap = {
            none: "rounded-none",
            sm: "rounded-sm",
            md: "rounded-md",
            lg: "rounded-lg",
            full: "rounded-full",
          } as const;

          return radiusMap[node.value as keyof typeof radiusMap]
            ? [radiusMap[node.value as keyof typeof radiusMap]]
            : [];
        }

        case "background":
          return [`bg-${node.value}`];

        case "color":
          return [`text-${node.value}`];

        case "content":
          return [
            `content-['${String(node.value ?? "").replace(/^"|"$/g, "")}']`,
          ];

        case "gap":
          return [`gap-${lengthToTailwindScale(node.value as Length, "gap")}`];

        case "paddingX":
          return [
            `px-${lengthToTailwindScale(node.value as Length, "paddingX")}`,
          ];

        case "paddingY":
          return [
            `py-${lengthToTailwindScale(node.value as Length, "paddingY")}`,
          ];

        case "transitionTimingFunction":
          return [easingToTailwind(node.value as Easing)];

        case "transition":
          return compileTransitionToTailwind(node.value as TransitionOptions);

        default:
          return [];
      }
    });
  }
}

function compileTransitionToTailwind(opts: TransitionOptions): string[] {
  const out: string[] = [];
  const prop = opts.property ?? "all";
  out.push(transitionPropertyToTailwind(prop));

  if (opts.duration !== undefined) {
    out.push(`duration-${durationToTailwindScale(opts.duration, "duration")}`);
  }
  if (opts.timing !== undefined) {
    out.push(easingToTailwind(opts.timing));
  }
  if (opts.delay !== undefined) {
    out.push(`delay-${durationToTailwindScale(opts.delay, "delay")}`);
  }
  return out;
}
