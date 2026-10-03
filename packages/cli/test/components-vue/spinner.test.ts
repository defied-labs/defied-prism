// @vitest-environment jsdom
/** Spinner behavior for the Vue target; mirrors test/components/spinner.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "spinner-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("spinner", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

describe("Spinner (vue)", () => {
  it("is a status announcing 'Loading' by default", () => {
    show(() => h(m.Spinner));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading");
    expect(status.querySelector('[data-slot="spinner-indicator"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("uses a custom label", () => {
    show(() => h(m.Spinner, { label: "Saving draft" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saving draft");
  });

  it("applies the size to every slot", () => {
    show(() => h(m.Spinner, { size: "lg" }));
    for (const slot of ["spinner", "spinner-indicator", "spinner-label"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-size")).toBe("lg");
    }
  });
});
