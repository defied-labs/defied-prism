import { describe, expect, it } from "vitest";

import {
  compileRecipeCss,
  compileRecipeTailwind,
  defineRecipe,
  token,
} from "../src/recipe";

const recipe = defineRecipe({
  name: "chip",
  base: {
    display: "inline-flex",
    fontFamily: token("font.sans"),
    transition: `background-color ${token("duration.fast")} ${token("easing.standard")}`,
    _focusVisible: { outline: `${token("focus.ring-width")} solid ${token("color.ring")}` },
    _disabled: { opacity: token("opacity.disabled") },
    "part:icon": { flexShrink: "0" },
  },
  variants: {
    tone: {
      primary: {
        background: token("color.primary"),
        _hover: { background: token("color.primary-hover") },
      },
      quiet: { background: "transparent" },
    },
    size: {
      sm: { paddingInline: token("space.2"), "part:icon": { width: "1rem" } },
    },
  },
  defaultVariants: { tone: "primary", size: "sm" },
});

describe("recipe compilers", () => {
  it("emits CSS with data-attribute variants, states and parts", () => {
    const { css, tokens } = compileRecipeCss(recipe, "modules");

    expect(css).toContain("font-family: var(--prism-font-sans);");
    expect(css).toContain(
      "transition: background-color var(--prism-duration-fast) var(--prism-easing-standard);",
    );
    expect(css).toContain(".root:focus-visible {\n  outline: var(--prism-focus-ring-width) solid var(--prism-color-ring);");
    expect(css).toContain(".root:disabled {\n  opacity: var(--prism-opacity-disabled);");
    expect(css).toContain('.root [data-part="icon"] {\n  flex-shrink: 0;');
    expect(css).toContain('.root[data-tone="primary"]:hover:enabled:not([aria-disabled="true"]) {\n  background: var(--prism-color-primary-hover);');
    expect(css).toContain('.root[data-size="sm"] [data-part="icon"] {\n  width: 1rem;');
    expect(tokens).toContain("color.primary-hover");
  });

  it("defaults the root to a vanilla prism-<name> class", () => {
    expect(compileRecipeCss(recipe).css).toContain(".prism-chip {");
  });

  it("emits real Tailwind utilities where equivalent, arbitrary properties otherwise", () => {
    const tw = compileRecipeTailwind(recipe);

    expect(tw.slots.root!.base.split(" ")).toEqual([
      "inline-flex",
      "font-prism-sans",
      "[transition:background-color_var(--prism-duration-fast)_var(--prism-easing-standard)]",
      "focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)]",
      // No Tailwind theme namespace for opacity: v4's variable shorthand
      "disabled:opacity-(--prism-opacity-disabled)",
      "[&_[data-part=icon]]:shrink-0",
    ]);
    expect(tw.slots.root!.variants.tone!.primary).toBe(
      "bg-prism-primary enabled:not-aria-disabled:hover:bg-prism-primary-hover",
    );
    expect(tw.slots.root!.variants.size!.sm).toBe("px-prism-2 [&_[data-part=icon]]:[width:1rem]");
  });

  it("rejects unknown tokens, states and default variants", () => {
    expect(() =>
      compileRecipeCss({ name: "x", base: { color: "{color.nope}" } }),
    ).toThrow(/Unknown design token/);
    expect(() =>
      compileRecipeCss({ name: "x", base: { _hovr: { color: "red" } } }),
    ).toThrow(/Unknown state "_hovr"/);
    expect(() =>
      compileRecipeCss({ name: "x", base: {}, variants: { size: { sm: {} } }, defaultVariants: { size: "xl" } }),
    ).toThrow(/not a declared variant/);
  });

  it("rejects a property owned by two sources", () => {
    expect(() =>
      compileRecipeTailwind({
        name: "x",
        base: { background: "red" },
        variants: { tone: { a: { background: "blue" } } },
      }),
    ).toThrow(/"background" is set by base and tone/);

    expect(() =>
      compileRecipeCss({
        name: "x",
        base: {},
        variants: {
          tone: { a: { _hover: { color: "red" } } },
          size: { sm: { _hover: { color: "blue" } } },
        },
      }),
    ).toThrow(/"color" \(_hover\) is set by tone and size/);
  });

  it("rejects mixing a shorthand with its longhand", () => {
    expect(() =>
      compileRecipeCss({
        name: "x",
        base: { border: "1px solid red", borderRightColor: "blue" },
      }),
    ).toThrow(/"border" and "border-right-color" are both set/);
    expect(() =>
      compileRecipeCss({
        name: "x",
        base: { borderWidth: "1px", borderRadius: "4px", outline: "none", outlineOffset: "2px" },
      }),
    ).not.toThrow();
  });

  it("allows the same property on different states or parts", () => {
    expect(() =>
      compileRecipeCss({
        name: "x",
        base: { color: "red", _hover: { color: "blue" }, "part:icon": { color: "green" } },
      }),
    ).not.toThrow();
  });

  it("escapes underscores in Tailwind values", () => {
    expect(
      compileRecipeTailwind({ name: "x", base: { gridArea: "a_b" } }).slots.root!.base,
    ).toBe(String.raw`[grid-area:a\_b]`);
  });

  describe("slots", () => {
    const dialog = defineRecipe({
      name: "dialog",
      base: { display: "contents" },
      slots: {
        overlay: { position: "fixed", _open: { opacity: "1" } },
        content: { background: token("color.bg") },
      },
      variants: {
        size: {
          sm: { "slot:content": { maxWidth: "24rem" } },
          lg: { "slot:content": { maxWidth: "40rem" } },
        },
      },
    });

    it("gives each slot its own class in every target", () => {
      expect(compileRecipeCss(dialog, "modules").classNames).toEqual({
        root: "root",
        overlay: "overlay",
        content: "content",
      });
      const vanilla = compileRecipeCss(dialog);
      expect(vanilla.classNames.content).toBe("prism-dialog-content");
      expect(vanilla.css).toContain('.prism-dialog-overlay[data-state="open"] {\n  opacity: 1;');
      expect(vanilla.css).toContain('.prism-dialog-content[data-size="lg"] {\n  max-width: 40rem;');
    });

    it("returns per-slot Tailwind lookups", () => {
      const { slots } = compileRecipeTailwind(dialog);
      expect(slots.overlay!.base).toBe("fixed data-[state=open]:[opacity:1]");
      expect(slots.content!.variants.size!.sm).toBe("[max-width:24rem]");
      expect(slots.root!.variants).toEqual({});
    });

    it("tracks ownership per slot", () => {
      expect(() =>
        compileRecipeCss({
          name: "x",
          base: {},
          slots: { content: { maxWidth: "1rem" } },
          variants: { size: { sm: { "slot:content": { maxWidth: "2rem" } } } },
        }),
      ).toThrow(/"max-width" \(slot content\) is set by base and size/);
      expect(() =>
        compileRecipeCss({
          name: "x",
          base: { maxWidth: "1rem" },
          slots: { content: {} },
          variants: { size: { sm: { "slot:content": { maxWidth: "2rem" } } } },
        }),
      ).not.toThrow();
    });

    it("rejects undeclared or misplaced slots", () => {
      expect(() =>
        compileRecipeCss({ name: "x", base: {}, variants: { size: { sm: { "slot:nope": {} } } } }),
      ).toThrow(/not a declared slot/);
      expect(() =>
        compileRecipeCss({ name: "x", base: { "slot:content": {} }, slots: { content: {} } }),
      ).toThrow(/only allowed at the top level of a variant/);
    });
  });
});
