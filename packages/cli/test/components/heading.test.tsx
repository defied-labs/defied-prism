// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "heading";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("heading", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Heading", () => {
  it("renders the element for its level", () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      render(h(m.Heading, { level }, "Title"));
      expect(screen.getByRole("heading", { level }).tagName).toBe(`H${level}`);
      cleanup();
    }
  });

  it("derives size from level unless given", () => {
    const expected = { 1: "xl", 2: "lg", 3: "md", 4: "sm", 5: "xs", 6: "xs" } as const;
    for (const [level, size] of Object.entries(expected)) {
      render(h(m.Heading, { level: Number(level) }, "Title"));
      expect(screen.getByRole("heading").getAttribute("data-size")).toBe(size);
      cleanup();
    }
    render(h(m.Heading, { level: 1, size: "sm" }, "Title"));
    expect(screen.getByRole("heading", { level: 1 }).getAttribute("data-size")).toBe("sm");
  });
});
