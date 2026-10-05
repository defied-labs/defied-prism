/**
 * Every class the Tailwind target generates must compile in real Tailwind
 * v4 with Prism's theme (tokens/tailwind.css). A typo'd utility or an
 * unmapped theme key would otherwise leave a component silently unstyled.
 */
import path from "node:path";
import { compile } from "@tailwindcss/node";
import { compileRecipeTailwind } from "@defied-labs/prism-style-engine";
import { buildTailwindCss } from "@defied-labs/prism-tokens";
import { expect, it } from "vitest";

import { readRegistryComponent, selectedComponents } from "./support/generated";

it("every generated Tailwind class compiles", async () => {
  const compiler = await compile(`@import "tailwindcss";\n${buildTailwindCss()}`, {
    base: path.resolve(__dirname),
    onDependency() {},
  });

  const classes = new Map<string, string>();
  for (const name of selectedComponents) {
    const { slots } = compileRecipeTailwind(readRegistryComponent(name).recipe);
    for (const slot of Object.values(slots)) {
      const all = [slot.base, ...Object.values(slot.variants).flatMap((d) => Object.values(d))];
      for (const cls of all.join(" ").split(/\s+/).filter(Boolean)) classes.set(cls, name);
    }
  }

  // Tailwind's output only grows for candidates it recognizes
  const unrecognized: string[] = [];
  let length = compiler.build([]).length;
  for (const [cls, name] of classes) {
    const next = compiler.build([cls]).length;
    if (next === length) unrecognized.push(`${name}: ${cls}`);
    length = next;
  }
  expect(unrecognized).toEqual([]);
  expect(classes.size).toBeGreaterThan(0);
}, 60_000);
