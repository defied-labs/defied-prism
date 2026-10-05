import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { flattenRecipe, type Declarations } from "@defied-labs/prism-style-engine";

import { ManifestValidator } from "../src/registry/ManifestValidator";
import { RecipeValidator } from "../src/registry/RecipeValidator";

import { selectedComponents } from "./support/generated";

const componentsDir = path.resolve(__dirname, "../../core/components");

function partsIn(declarations: Declarations, out = new Set<string>()): Set<string> {
  for (const [key, value] of Object.entries(declarations)) {
    if (typeof value !== "object") continue;
    if (key.startsWith("part:")) out.add(key.slice(5));
    partsIn(value, out);
  }
  return out;
}

/**
 * Static half of the component contract: manifest, contract and recipe must
 * agree. The behavioral half lives in contract.test.tsx.
 */
describe.each(selectedComponents)("registry component %s", (name) => {
  const dir = path.join(componentsDir, name);
  const manifest = ManifestValidator.validate(
    JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8")),
    name,
  );
  const recipe = RecipeValidator.parse(
    readFileSync(path.join(dir, "recipe.json"), "utf8"),
    name,
  );
  const contract = manifest.contract!;

  it("declares a contract", () => {
    expect(contract).toBeDefined();
  });

  it("keeps each framework's packages in its own target", () => {
    const own: Record<string, string[]> = {
      react: ["react", "react-dom", "@defied-labs/prism-react"],
      vue: ["vue", "@defied-labs/prism-vue"],
    };
    const frameworkPackages = Object.values(own).flat();
    // Shared packages only at the top level: a Vue project must never get React
    for (const dependency of manifest.dependencies) {
      expect(frameworkPackages, dependency.package).not.toContain(dependency.package);
    }
    for (const target of manifest.compatibility.frameworks) {
      expect(target.runtimeVersion.package).toBe(`@defied-labs/prism-${target.framework}`);
      expect(target.dependencies.map((d) => d.package)).toContain(`@defied-labs/prism-${target.framework}`);
      for (const dependency of target.dependencies) {
        expect(own[target.framework], `${target.framework}: ${dependency.package}`).toContain(dependency.package);
      }
    }
  });

  it("ships every file it declares", () => {
    for (const framework of manifest.compatibility.frameworks) {
      for (const file of framework.files) {
        expect(existsSync(path.join(dir, file.source)), file.source).toBe(true);
      }
    }
  });

  it("templates carry no lint directives (they're copied into projects with any ESLint setup)", () => {
    for (const framework of manifest.compatibility.frameworks) {
      for (const file of framework.files) {
        const source = readFileSync(path.join(dir, file.source), "utf8");
        // A directive naming a rule from a plugin the project lacks is itself an error
        expect(source, file.source).not.toMatch(/eslint-disable/);
      }
    }
  });

  it("imports sibling components exactly as declared in registryDependencies", () => {
    const pascal = (s: string) => s.replace(/(^|-)([a-z])/g, (_m, _d, c: string) => c.toUpperCase());
    const imported = new Set<string>();
    for (const framework of manifest.compatibility.frameworks) {
      for (const file of framework.files) {
        const source = readFileSync(path.join(dir, file.source), "utf8");
        for (const [, sibling] of source.matchAll(/from\s+["']\.\/([A-Z][A-Za-z]+)["']/g)) imported.add(sibling!);
        // Vue components are folders: a sibling component is imported as "../button"
        for (const [, sibling] of source.matchAll(/from\s+["']\.\.\/([a-z][a-z-]*)["']/g)) imported.add(pascal(sibling!));
      }
    }
    const declared = new Set((manifest.registryDependencies ?? []).map(pascal));
    // Only generated component files count: stylesheets are imported by the generator
    expect([...imported].sort()).toEqual([...declared].sort());
    for (const dependency of manifest.registryDependencies ?? []) {
      expect(existsSync(path.join(componentsDir, dependency, "manifest.json")), dependency).toBe(true);
    }
  });

  it("styles exactly the contract's enum props, with the same values and defaults", () => {
    const enumProps = Object.entries(contract.props).filter(
      ([, prop]) => prop.type === "enum" && prop.visual,
    );
    for (const [prop, spec] of enumProps) {
      if (spec.type !== "enum") continue;
      expect(Object.keys(recipe.variants?.[prop] ?? {}).sort(), prop).toEqual([...spec.values].sort());
      expect(recipe.defaultVariants?.[prop], prop).toBe(spec.default);
    }
  });

  it("only styles variant dimensions the contract declares", () => {
    for (const [dimension, values] of Object.entries(recipe.variants ?? {})) {
      const prop = contract.props[dimension];
      expect(prop, `recipe dimension "${dimension}"`).toBeDefined();
      if (prop?.type === "boolean") {
        expect(Object.keys(values)).toEqual(["true"]);
      }
    }
  });

  it("styles exactly the slots the contract declares", () => {
    const declared = Object.keys(contract.slots ?? { root: {} });
    expect(["root", ...Object.keys(recipe.slots ?? {})].sort()).toEqual(
      [...new Set(["root", ...declared])].sort(),
    );
  });

  it("only styles parts the contract declares", () => {
    const styled = new Set([
      ...partsIn(recipe.base),
      ...Object.values(recipe.slots ?? {}).flatMap((d) => [...partsIn(d)]),
      ...Object.values(recipe.variants ?? {}).flatMap((values) =>
        Object.values(values).flatMap((d) => [...partsIn(d)]),
      ),
    ]);
    for (const part of styled) {
      expect(contract.parts, `part "${part}"`).toContain(part);
    }
  });

  it("declares exactly the design tokens its recipe uses", () => {
    expect(manifest.tokens.map((t) => t.name).sort()).toEqual(
      flattenRecipe(recipe).tokens,
    );
  });

  it("only claims what the tests verify", () => {
    // Automated axe checks run for every registry component in contract.test.tsx
    expect(manifest.tests.accessibility).toBe(true);
    expect(manifest.accessibility.standard).toBeUndefined();
  });
});
