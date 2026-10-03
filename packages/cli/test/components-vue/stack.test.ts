// @vitest-environment jsdom
/** Stack behavior for the Vue target; mirrors test/components/stack.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "stack-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("stack", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

describe("Stack (vue)", () => {
  it("renders the `as` element, e.g. a list", () => {
    show(() => h(m.Stack, { as: "ul", gap: "lg" }, () => [h("li", "One"), h("li", "Two")]));
    const list = screen.getByRole("list");
    expect(list.getAttribute("data-slot")).toBe("stack");
    expect(list.getAttribute("data-gap")).toBe("lg");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
