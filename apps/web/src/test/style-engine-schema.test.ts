import { describe, expect, it } from "vitest";
import { defineStyle } from "../../../../packages/style-engine/src/dsl/defineStyle";
import { property } from "../../../../packages/style-engine/src/dsl/context";

describe("Style Engine Schema & Builder Validation", () => {
  it("creates valid StyleDefinition from structured nodes", () => {
    const style = defineStyle({
      base: [property("display", "flex") as any],
      variants: {
        primary: [property("background", "blue-500") as any],
      },
    });

    expect(style.base).toHaveLength(1);
    expect(style.variants?.primary).toHaveLength(1);
  });

  it("rejects non-object or non-array base definitions", () => {
    expect(() => defineStyle(null as any)).toThrow(/requires a style definition object/);
    expect(() => defineStyle({ base: "flex" as any })).toThrow(/base must be an array/);
  });

  it("rejects invalid or unknown node types", () => {
    expect(() =>
      defineStyle({
        base: [{ type: "unknown-type" } as any],
      }),
    ).toThrow(/Unknown style node type/);
  });

  it("rejects PropertyNode missing property name", () => {
    expect(() =>
      defineStyle({
        base: [{ type: "property", value: "flex" } as any],
      }),
    ).toThrow(/must specify "property" name/);
  });
});
