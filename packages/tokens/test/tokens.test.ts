import { describe, expect, it } from "vitest";

import {
  buildTailwindCss,
  buildTokensCss,
  contrast,
  cssVar,
  TEXT_PAIRS,
  UI_PAIRS,
  resolveTokenRefs,
  themes,
  tokenPaths,
} from "../src";

describe.each(Object.keys(themes) as (keyof typeof themes)[])(
  "%s theme",
  (theme) => {
    const colors = themes[theme];

    it("defines every color token", () => {
      expect(Object.keys(colors).sort()).toEqual(Object.keys(themes.light).sort());
    });

    it.each(TEXT_PAIRS)("%s on %s meets WCAG AA (4.5:1)", (fg, bg) => {
      expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
    });

    it.each(UI_PAIRS)("%s on %s meets 3:1 for UI components", (fg, bg) => {
      expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(3);
    });
  },
);

describe("token references", () => {
  it("resolves references to CSS variables and reports them", () => {
    const used: string[] = [];
    expect(
      resolveTokenRefs("{space.2} {space.4}", (p) => used.push(p)),
    ).toBe("var(--prism-space-2) var(--prism-space-4)");
    expect(used).toEqual(["space.2", "space.4"]);
  });

  it("rejects unknown tokens", () => {
    expect(() => resolveTokenRefs("{color.nope}")).toThrow(/Unknown design token/);
  });

  it("passes literal CSS through untouched", () => {
    expect(resolveTokenRefs("1px solid transparent")).toBe("1px solid transparent");
  });
});

describe("generated CSS", () => {
  const css = buildTokensCss();

  it("declares every token", () => {
    for (const path of tokenPaths) {
      expect(css).toContain(cssVar(path).slice(4, -1) + ":");
    }
  });

  it("supports class, attribute and OS-level dark mode", () => {
    expect(css).toContain(".dark,\n[data-theme=\"dark\"]");
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("removes motion under prefers-reduced-motion", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*--prism-duration-fast: 0ms/);
  });

  it("ships the shared keyframes", () => {
    expect(css).toContain("@keyframes prism-spin");
    expect(css).toContain("@keyframes prism-fade-in");
    expect(css).toContain("@keyframes prism-scale-in");
    expect(css).toContain("@keyframes prism-pulse");
    expect(css).toContain("@keyframes prism-indeterminate");
    expect(css).toContain("@keyframes prism-slide-in");
  });

  it("maps tokens into the Tailwind v4 theme", () => {
    const tw = buildTailwindCss();
    expect(tw).toContain("@theme inline");
    expect(tw).toContain("--color-prism-primary: var(--prism-color-primary);");
    expect(tw).toContain("--spacing-prism-4: var(--prism-space-4);");
    expect(tw).toContain("--ease-prism-standard: var(--prism-easing-standard);");
    // Namespaced: never overrides an app's own theme values
    expect(tw).not.toMatch(/--color-primary:|--radius-md:|--font-sans:/);
  });
});
