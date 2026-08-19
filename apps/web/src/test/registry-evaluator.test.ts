import { describe, expect, it } from "vitest";
import { ManifestValidator } from "../../../../packages/cli/src/registry/ManifestValidator";
import { StyleEvaluator } from "../../../../packages/cli/src/registry/StyleEvaluator";

describe("Registry Architecture: ManifestValidator & StyleEvaluator", () => {
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

  describe("StyleEvaluator", () => {
    it("safely strips multi-line and named imports without array bounds overflow", () => {
      const tsCode = `
import {
  defineStyle,
  bg,
  text
} from "@defied-prism/style-engine";

export default defineStyle({
  base: [bg("blue-500"), text("white")],
});
`;
      const stripped = StyleEvaluator.stripImports(tsCode);
      expect(stripped).not.toContain("import");
      expect(stripped).toContain("export default defineStyle");
    });

    it("evaluates TypeScript style scripts with type annotations", async () => {
      const code = `
import { defineStyle, bg } from "@defied-prism/style-engine";

const primaryBg: string = "blue-600";
export default defineStyle({
  base: [bg(primaryBg as any)],
});
`;
      const style = await StyleEvaluator.evaluate(code, "test-comp");
      expect(style).toBeDefined();
      expect(style.base).toHaveLength(1);
    });

    it("rejects invalid script outputs missing base array", async () => {
      const badCode = `export default { foo: "bar" };`;
      await expect(
        StyleEvaluator.evaluate(badCode, "bad-comp"),
      ).rejects.toThrow(/missing required "base" array/);
    });
  });
});
