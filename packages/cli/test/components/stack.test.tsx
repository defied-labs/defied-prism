// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "stack";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("stack", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Stack", () => {
  it("renders the `as` element, e.g. a list", () => {
    render(h(m.Stack, { as: "ul", gap: "lg" }, h("li", null, "One"), h("li", null, "Two")));
    const list = screen.getByRole("list");
    expect(list.getAttribute("data-slot")).toBe("stack");
    expect(list.getAttribute("data-gap")).toBe("lg");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
