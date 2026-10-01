import { describe, expect, it } from "vitest";

import { slotClass, variantData, type StyleSlots } from "../lib";

const slots: StyleSlots = {
  root: {
    base: "a",
    variants: { size: { sm: "s", md: "m" }, fullWidth: { true: "w" } },
  },
  content: { base: "c", variants: {} },
};

describe("slot helpers", () => {
  it("combines base, active variants and extra classes", () => {
    expect(slotClass(slots, "root", { size: "sm", fullWidth: true }, "user")).toBe("a s w user");
  });

  it("skips false, missing and unknown variants", () => {
    expect(slotClass(slots, "root", { size: "xl", fullWidth: false, tone: undefined })).toBe("a");
  });

  it("works for CSS-target slots with no variant lookups", () => {
    expect(slotClass(slots, "content", { size: "sm" }, undefined)).toBe("c");
    expect(slotClass(slots, "missing", {}, "user")).toBe("user");
  });

  it("builds kebab-case data attributes", () => {
    expect(variantData({ size: "md", fullWidth: true, loading: false, x: undefined })).toEqual({
      "data-size": "md",
      "data-full-width": "true",
    });
  });
});
