import { describe, expect, it } from "vitest";

import { parseThemeOptions } from "../src/commands/theme";

describe("prism theme options", () => {
  it("dark follows light unless overridden", () => {
    const { light, dark } = parseThemeOptions({ primary: "#0d9488", set: ["dark.link=#99f6e4", "ring=#000000"] });
    expect(light).toEqual({ primary: "#0d9488", ring: "#000000" });
    expect(dark).toEqual({ primary: "#0d9488", ring: "#000000", link: "#99f6e4" });
  });

  it("rejects unknown tokens, malformed entries and empty input", () => {
    expect(() => parseThemeOptions({ set: ["brand=#000"] })).toThrow(/Unknown color token/);
    expect(() => parseThemeOptions({ set: ["primary"] })).toThrow(/token=value/);
    expect(() => parseThemeOptions({})).toThrow(/Nothing to theme/);
  });
});
