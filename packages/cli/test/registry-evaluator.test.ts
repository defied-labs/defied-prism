import { describe, expect, it } from "vitest";
import { ManifestValidator } from "../src/registry/ManifestValidator";
import { RecipeValidator } from "../src/registry/RecipeValidator";

describe("Registry Architecture: ManifestValidator & RecipeValidator", () => {
  describe("ManifestValidator", () => {
    it("validates well-formed component manifest", () => {
      const valid = {
        metadata: { name: "button" },
        compatibility: { frameworks: [{ framework: "react" }] },
      };
      expect(ManifestValidator.validate(valid, "button")).toBeDefined();
    });

    it("rejects non-object or missing metadata", () => {
      expect(() => ManifestValidator.validate(null, "button")).toThrow(
        /Malformed manifest/,
      );
      expect(() => ManifestValidator.validate({}, "button")).toThrow(
        /missing "metadata"/,
      );
    });

    it("rejects component name mismatch", () => {
      const valid = {
        metadata: { name: "input" },
        compatibility: { frameworks: [] },
      };
      expect(() => ManifestValidator.validate(valid, "button")).toThrow(
        /name mismatch/,
      );
    });
  });

  describe("RecipeValidator", () => {
    it("accepts a well-formed recipe", () => {
      const recipe = RecipeValidator.parse(
        JSON.stringify({ name: "ok", base: { color: "{color.fg}" }, variants: { size: { sm: {} } } }),
        "ok",
      );
      expect(recipe.name).toBe("ok");
    });

    it("rejects invalid JSON", () => {
      expect(() => RecipeValidator.parse("export default {}", "bad")).toThrow(
        /Failed to parse recipe.json/,
      );
    });

    it("rejects recipes missing a base object", () => {
      expect(() => RecipeValidator.validate({ name: "x" }, "bad")).toThrow(
        /missing a "base" object/,
      );
    });

    it("rejects recipes that reference unknown tokens", () => {
      expect(() =>
        RecipeValidator.validate({ name: "x", base: { color: "{color.nope}" } }, "bad"),
      ).toThrow(/invalid recipe: .*Unknown design token/);
    });
  });
});
