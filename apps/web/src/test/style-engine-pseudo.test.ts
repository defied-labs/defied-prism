import { describe, expect, it } from "vitest";

import { CSSModulesCompiler } from "../../../../packages/style-engine/src/compiler/CSSModulesCompiler";
import { TailwindCompiler } from "../../../../packages/style-engine/src/compiler/TailwindCompiler";
import { StyleParser } from "../../../../packages/style-engine/src/parser/StyleParser";
import {
  after,
  before,
  focusVisible,
  hover,
  pseudo,
} from "../../../../packages/style-engine/src/dsl/pseudo";
import {
  content,
  property,
} from "../../../../packages/style-engine/src/dsl/context";
import { defineStyle } from "../../../../packages/style-engine/src/dsl/defineStyle";

describe("style engine pseudo selectors", () => {
  describe("DSL helpers", () => {
    it("rejects pseudo names missing the leading ':'", () => {
      expect(() => pseudo("hover")).toThrow();
    });

    it("emit variant nodes with the canonical CSS marker", () => {
      expect(before()).toEqual({
        type: "variant",
        name: "::before",
        styles: [],
      });
      expect(hover()).toEqual({
        type: "variant",
        name: ":hover",
        styles: [],
      });
      expect(focusVisible()).toEqual({
        type: "variant",
        name: ":focus-visible",
        styles: [],
      });
    });
  });

  describe("parser", () => {
    it("lifts pseudo variants dropped directly into base", () => {
      const parser = new StyleParser();
      const parsed = parser.parse(
        defineStyle({
          base: [
            property("display", "flex") as any,
            hover(property("background", "blue-500") as any) as any,
            before(content("✓") as any) as any,
          ],
        }),
      );

      expect(parsed.base).toHaveLength(1);
      expect(parsed.base[0]).toMatchObject({ property: "display" });
      // The variant keys preserve the leading CSS markers.
      expect(Object.keys(parsed.variants)).toEqual(
        expect.arrayContaining([":hover", "::before"]),
      );
    });
  });

  describe("CSS Modules compiler", () => {
    it("emits .root:hover / .root:focus-visible selectors with properties", () => {
      const parser = new StyleParser();
      const compiler = new CSSModulesCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [property("background", "blue-500") as any],
          variants: {
            ":hover": [property("background", "blue-600") as any],
            ":focus-visible": [property("borderRadius", "md") as any],
          },
        }),
      );

      const { css } = compiler.compileFile(parsed);

      expect(css).toContain(".root:hover {");
      expect(css).toContain("background: var(--color-blue-600);");
      expect(css).toContain(".root:focus-visible {");
      // "md" is in the radius lookup table and is emitted literally, not
      // via the design token.
      expect(css).toContain("border-radius: 0.375rem;");
    });

    it("always injects a default content: '' for ::before/::after", () => {
      const parser = new StyleParser();
      const compiler = new CSSModulesCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [],
          variants: {
            "::after": [property("display", "block") as any],
          },
        }),
      );

      const { css } = compiler.compileFile(parsed);

      expect(css).toContain(".root::after {");
      expect(css).toMatch(/content: "";/);
    });

    it("keeps a user-supplied content declaration verbatim", () => {
      const parser = new StyleParser();
      const compiler = new CSSModulesCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [],
          variants: {
            "::before": [content("✓") as any],
          },
        }),
      );

      const { css } = compiler.compileFile(parsed);

      expect(css).toContain('content: "✓";');
    });
  });

  describe("Tailwind compiler", () => {
    it("prefixes every utility in a :hover variant with hover:", () => {
      const parser = new StyleParser();
      const compiler = new TailwindCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [],
          variants: {
            ":hover": [property("background", "blue-600") as any],
          },
        }),
      );

      const variants = compiler.compileVariants(parsed);

      expect(variants[":hover"]).toBe("hover:bg-blue-600");
    });

    it("prefixes utilities in :focus-visible with focus-visible:", () => {
      const parser = new StyleParser();
      const compiler = new TailwindCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [],
          variants: {
            ":focus-visible": [property("borderRadius", "md") as any],
          },
        }),
      );

      const variants = compiler.compileVariants(parsed);

      expect(variants[":focus-visible"]).toBe("focus-visible:rounded-md");
    });

    it("maps ::before and ::after to before:/after: variants", () => {
      const parser = new StyleParser();
      const compiler = new TailwindCompiler();

      const parsed = parser.parse(
        defineStyle({
          base: [],
          variants: {
            "::before": [
              property("display", "flex") as any,
              content("✓") as any,
            ],
            "::after": [property("background", "blue-500") as any],
          },
        }),
      );

      const variants = compiler.compileVariants(parsed);

      expect(variants["::before"]).toContain("before:flex");
      expect(variants["::before"]).toContain("before:content-['✓']");
      expect(variants["::after"]).toBe("after:bg-blue-500");
    });
  });
});
