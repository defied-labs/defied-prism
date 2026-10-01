// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "spinner";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("spinner", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Spinner", () => {
  it("is a status announcing 'Loading' by default", () => {
    render(h(m.Spinner));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading");
    expect(status.querySelector('[data-slot="spinner-indicator"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("uses a custom label", () => {
    render(h(m.Spinner, { label: "Saving draft" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saving draft");
  });

  it("applies the size to every slot", () => {
    render(h(m.Spinner, { size: "lg" }));
    for (const slot of ["spinner", "spinner-indicator", "spinner-label"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-size")).toBe("lg");
    }
  });
});
