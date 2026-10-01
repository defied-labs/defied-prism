import { describe, expect, it } from "vitest";

import { buildThemeCss, checkContrast, contrast, parseColor, resolveTheme, themes, toHex } from "../src";

describe("parseColor", () => {
  it("reads hex, rgb() and oklch()", () => {
    expect(toHex(parseColor("#6d28d9"))).toBe("#6d28d9");
    expect(toHex(parseColor("#fff"))).toBe("#ffffff");
    expect(toHex(parseColor("rgb(255 0 0)"))).toBe("#ff0000");
    expect(toHex(parseColor("rgb(0, 128, 255)"))).toBe("#0080ff");
    expect(toHex(parseColor("oklch(1 0 0)"))).toBe("#ffffff");
    expect(toHex(parseColor("oklch(0 0 0)"))).toBe("#000000");
    // Tailwind's teal-500
    expect(toHex(parseColor("oklch(70.4% 0.14 182.503)"))).toBe("#00bba7");
  });

  it("rejects what it can't measure", () => {
    expect(() => parseColor("var(--primary)")).toThrow(/Unsupported color/);
  });
});

describe("resolveTheme", () => {
  it("defaults are unchanged", () => {
    expect(resolveTheme("light")).toEqual(themes.light);
  });

  it("one brand color yields shades, readable text, ring and links that meet AA", () => {
    // The demo app's teal: light enough that white text on it fails
    for (const theme of ["light", "dark"] as const) {
      const colors = resolveTheme(theme, { primary: "oklch(0.7318 0.1207 164.15)" });
      expect(colors.primary).not.toBe(themes[theme].primary);
      expect(contrast(colors["primary-fg"], colors.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.link, colors.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.ring, colors.bg)).toBeGreaterThanOrEqual(3);
      // Interaction states are visibly different from rest
      expect(colors["primary-hover"]).not.toBe(colors.primary);
      expect(colors["link-hover"]).not.toBe(colors.link);
      expect(checkContrast(theme, colors).filter((i) => i.fg.startsWith("primary") || i.fg === "link")).toEqual(
        [],
      );
    }
  });

  it("keeps explicit values", () => {
    const colors = resolveTheme("light", { primary: "#0d9488", "primary-hover": "#123456" });
    expect(colors["primary-hover"]).toBe("#123456");
  });

  it("rejects unknown tokens", () => {
    expect(() => resolveTheme("light", { brand: "#000" } as never)).toThrow(/Unknown color token/);
  });
});

describe("buildThemeCss", () => {
  it("writes only changed colors, for light, dark and the OS preference", () => {
    const { css, issues } = buildThemeCss({ light: { primary: "#0d9488" } });
    expect(css).toContain("--prism-color-primary: #0d9488;");
    expect(css).not.toContain("--prism-color-bg:");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(issues).toEqual([]);
  });

  it("reports contrast failures it was told to keep", () => {
    const { issues } = buildThemeCss({ light: { primary: "#fde047", "primary-fg": "#ffffff" } });
    expect(issues.some((i) => i.fg === "primary-fg" && i.bg === "primary")).toBe(true);
  });
});
