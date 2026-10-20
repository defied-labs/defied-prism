import { resolveTokenRefs, type TokenPath } from "@defied/prism-tokens";

import { tailwindUtility } from "./tailwind-utilities";
import {
  RECIPE_STATES,
  type Declarations,
  type Recipe,
  type RecipeState,
  type SlotClasses,
} from "./types";

interface Segment {
  kind: "state" | "part" | "variant";
  css: string;
  /** Tailwind variant prefix; variants are selected by lookup, not prefix. */
  tailwind: string;
  label: string;
}

interface Rule {
  slot: string;
  /** "base" or "<dimension>.<value>" */
  origin: string;
  chain: Segment[];
  property: string;
  value: string;
  /** Set when the value is exactly one token reference, e.g. `{color.primary}`. */
  token?: TokenPath;
}

export const ROOT_SLOT = "root";

/** Properties whose name extends another's without being its longhand. */
const NOT_LONGHANDS = new Set([
  "border-radius",
  "border-spacing",
  "border-collapse",
  "outline-offset",
  "text-underline-offset",
]);

const kebab = (property: string) =>
  property.startsWith("--")
    ? property
    : property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const CAMEL = /^[a-z][a-zA-Z0-9]*$/;

function flatten(
  declarations: Declarations,
  slot: string,
  origin: string,
  chain: Segment[],
  tokens: Set<TokenPath>,
  out: Rule[],
): void {
  for (const [key, value] of Object.entries(declarations)) {
    const where = `${origin}${slot === ROOT_SLOT ? "" : ` (slot ${slot})`}`;
    if (key.startsWith("_")) {
      const state = RECIPE_STATES[key as RecipeState];
      if (!state) {
        throw new Error(
          `[prism] Unknown state "${key}" in ${where}. Known: ${Object.keys(RECIPE_STATES).join(", ")}.`,
        );
      }
      if (typeof value !== "object") {
        throw new Error(`[prism] State "${key}" in ${where} must be an object.`);
      }
      flatten(value, slot, origin, [...chain, { kind: "state", ...state, label: key }], tokens, out);
    } else if (key.startsWith("part:")) {
      const part = key.slice(5);
      if (!/^[a-z][a-z0-9-]*$/.test(part) || typeof value !== "object") {
        throw new Error(`[prism] Invalid part "${key}" in ${where}.`);
      }
      const selector = `[data-part="${part}"]`;
      flatten(
        value,
        slot,
        origin,
        [
          ...chain,
          { kind: "part", css: ` ${selector}`, tailwind: `[&_[data-part=${part}]]:`, label: key },
        ],
        tokens,
        out,
      );
    } else if (key.startsWith("slot:")) {
      throw new Error(
        `[prism] "${key}" in ${where}: slot keys are only allowed at the top level of a variant.`,
      );
    } else {
      if (typeof value !== "string") {
        throw new Error(`[prism] "${key}" in ${where} must be a string value.`);
      }
      const single = /^\{([a-z0-9-]+\.[a-z0-9-]+)\}$/i.exec(value.trim());
      out.push({
        slot,
        origin,
        chain,
        property: kebab(key),
        value: resolveTokenRefs(value, (path) => tokens.add(path)),
        ...(single ? { token: single[1] as TokenPath } : {}),
      });
    }
  }
}

export interface FlattenedRecipe {
  slots: string[];
  rules: Rule[];
  tokens: TokenPath[];
}

/**
 * Validates and flattens a recipe. Throws when two sources could set the
 * same property on the same element+state, because Tailwind would then
 * resolve the conflict by stylesheet order rather than intent.
 */
export function flattenRecipe(recipe: Recipe): FlattenedRecipe {
  if (!/^[a-z][a-z0-9-]*$/.test(recipe.name)) {
    throw new Error(`[prism] Recipe name "${recipe.name}" must be kebab-case.`);
  }
  const slots = [ROOT_SLOT, ...Object.keys(recipe.slots ?? {})];
  for (const slot of slots) {
    if (!CAMEL.test(slot)) throw new Error(`[prism] Slot "${slot}" must be camelCase.`);
  }
  if (recipe.slots && ROOT_SLOT in recipe.slots) {
    throw new Error(`[prism] Use "base" for the root slot, not slots.root.`);
  }

  const tokens = new Set<TokenPath>();
  const rules: Rule[] = [];

  flatten(recipe.base, ROOT_SLOT, "base", [], tokens, rules);
  for (const [slot, declarations] of Object.entries(recipe.slots ?? {})) {
    flatten(declarations, slot, "base", [], tokens, rules);
  }

  for (const [dimension, values] of Object.entries(recipe.variants ?? {})) {
    if (!CAMEL.test(dimension)) {
      throw new Error(`[prism] Variant dimension "${dimension}" must be camelCase.`);
    }
    for (const [value, declarations] of Object.entries(values)) {
      const selector = `[data-${kebab(dimension)}="${value}"]`;
      const segment: Segment = { kind: "variant", css: selector, tailwind: "", label: selector };
      const origin = `${dimension}.${value}`;
      const rootDeclarations: Declarations = {};
      for (const [key, nested] of Object.entries(declarations)) {
        if (!key.startsWith("slot:")) {
          rootDeclarations[key] = nested;
          continue;
        }
        const slot = key.slice(5);
        if (!slots.includes(slot) || slot === ROOT_SLOT || typeof nested !== "object") {
          throw new Error(`[prism] "${key}" in ${origin} is not a declared slot.`);
        }
        flatten(nested, slot, origin, [segment], tokens, rules);
      }
      flatten(rootDeclarations, ROOT_SLOT, origin, [segment], tokens, rules);
    }
  }

  for (const [dimension, value] of Object.entries(recipe.defaultVariants ?? {})) {
    if (!recipe.variants?.[dimension]?.[value]) {
      throw new Error(
        `[prism] defaultVariants.${dimension} = "${value}" is not a declared variant.`,
      );
    }
  }

  const describe = (slot: string, where: string) =>
    [slot === ROOT_SLOT ? "" : `slot ${slot}`, where].filter(Boolean).join(" ");

  // Shorthand + longhand on the same element/state (e.g. border and
  // border-right-color) would also be resolved by Tailwind's class order.
  const bySignature = new Map<string, Set<string>>();
  for (const rule of rules) {
    const where = rule.slot + "|" + rule.chain.map((s) => s.label).join(">");
    const set = bySignature.get(where) ?? new Set<string>();
    set.add(rule.property);
    bySignature.set(where, set);
  }
  for (const [key, properties] of bySignature) {
    const [slot, where] = key.split("|") as [string, string];
    for (const shorthand of properties) {
      const longhand = [...properties].find(
        (p) => p.startsWith(`${shorthand}-`) && !NOT_LONGHANDS.has(p),
      );
      if (longhand) {
        const on = describe(slot, where);
        throw new Error(
          `[prism] Recipe "${recipe.name}": "${shorthand}" and "${longhand}" are both set${on ? ` on ${on}` : ""}. ` +
            `Use longhands only so every CSS target resolves them identically.`,
        );
      }
    }
  }

  // Ownership: one source (base or a single variant dimension) per slot+state+property
  const owners = new Map<string, Set<string>>();
  for (const rule of rules) {
    const signature = [
      rule.slot,
      rule.chain.filter((s) => s.kind !== "variant").map((s) => s.label).join(">"),
      rule.property,
    ].join("|");
    const dimension = rule.origin === "base" ? "base" : rule.origin.split(".")[0]!;
    const set = owners.get(signature) ?? new Set<string>();
    set.add(dimension);
    owners.set(signature, set);
  }
  for (const [signature, dimensions] of owners) {
    if (dimensions.size > 1) {
      const [slot, where, property] = signature.split("|") as [string, string, string];
      const on = describe(slot, where);
      throw new Error(
        `[prism] Recipe "${recipe.name}": "${property}"${on ? ` (${on})` : ""} is set by ${[...dimensions].join(" and ")}. ` +
          `Each property may be owned by one source so every CSS target resolves it identically.`,
      );
    }
  }

  return { slots, rules, tokens: [...tokens].sort() };
}

export type CssTarget = "modules" | "vanilla";

/**
 * The class name each slot gets in a CSS target: `root` / `content` for
 * CSS Modules, `prism-dialog` / `prism-dialog-content` for vanilla CSS.
 */
export function slotClassName(recipe: Recipe, slot: string, target: CssTarget): string {
  if (target === "modules") return slot;
  return slot === ROOT_SLOT ? `prism-${recipe.name}` : `prism-${recipe.name}-${kebab(slot)}`;
}

export interface CssCompileResult {
  css: string;
  /** slot -> class name */
  classNames: Record<string, string>;
  tokens: TokenPath[];
}

/** Plain CSS for CSS Modules or vanilla CSS; variants select on `data-*` attributes. */
export function compileRecipeCss(
  recipe: Recipe,
  target: CssTarget = "vanilla",
): CssCompileResult {
  const { slots, rules, tokens } = flattenRecipe(recipe);
  const classNames = Object.fromEntries(
    slots.map((slot) => [slot, slotClassName(recipe, slot, target)]),
  );

  // Group declarations by selector, preserving first-seen order
  const blocks = new Map<string, string[]>();
  for (const rule of rules) {
    const selector = `.${classNames[rule.slot]}` + rule.chain.map((s) => s.css).join("");
    const list = blocks.get(selector) ?? [];
    list.push(`${rule.property}: ${rule.value};`);
    blocks.set(selector, list);
  }

  const css = [...blocks]
    .map(([selector, declarations]) => `${selector} {\n  ${declarations.join("\n  ")}\n}`)
    .join("\n\n");

  return {
    css: `/* Generated by Defied Prism from the "${recipe.name}" recipe. Do not edit. */\n${css}\n`,
    classNames,
    tokens,
  };
}

export interface TailwindCompileResult {
  slots: Record<string, SlotClasses>;
  tokens: TokenPath[];
}

/** Escape a CSS value for a Tailwind arbitrary property: spaces become "_". */
const escapeArbitrary = (value: string) =>
  value.replace(/_/g, "\\_").replace(/\s+/g, "_");

/**
 * Tailwind classes. Declarations become real utilities where one exists
 * (`bg-primary`, `px-4`, `flex`), so the output reads like hand-written
 * Tailwind and `className` overrides merge with it; anything else stays an
 * arbitrary property. Variants are returned as lookup tables per slot.
 */
export function compileRecipeTailwind(recipe: Recipe): TailwindCompileResult {
  const { slots, rules, tokens } = flattenRecipe(recipe);

  const toClass = (rule: Rule) => {
    const utility = tailwindUtility(rule.property, rule.value, rule.token);
    return rule.chain.map((s) => s.tailwind).join("") + (utility ?? `[${rule.property}:${escapeArbitrary(rule.value)}]`);
  };

  const out: Record<string, { base: string[]; variants: Record<string, Record<string, string[]>> }> =
    Object.fromEntries(slots.map((slot) => [slot, { base: [], variants: {} }]));

  for (const rule of rules) {
    const slot = out[rule.slot]!;
    if (rule.origin === "base") {
      slot.base.push(toClass(rule));
    } else {
      const [dimension, value] = rule.origin.split(".") as [string, string];
      ((slot.variants[dimension] ??= {})[value] ??= []).push(toClass(rule));
    }
  }

  return {
    slots: Object.fromEntries(
      Object.entries(out).map(([slot, { base, variants }]) => [
        slot,
        {
          base: base.join(" "),
          variants: Object.fromEntries(
            Object.entries(variants).map(([dimension, values]) => [
              dimension,
              Object.fromEntries(
                Object.entries(values).map(([value, classes]) => [value, classes.join(" ")]),
              ),
            ]),
          ),
        },
      ]),
    ),
    tokens,
  };
}
