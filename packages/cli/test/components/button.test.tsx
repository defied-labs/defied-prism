// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "button";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("button", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const button = () => screen.getByRole("button");

describe("Button composition attributes", () => {
  it("owns data-slot and data-state by default", () => {
    render(h(m.Button, null, "Save"));
    expect(button().getAttribute("data-slot")).toBe("button");
    expect(button().getAttribute("data-state")).toBe("idle");
  });

  it("reflects disabled and loading in data-state", () => {
    const { rerender } = render(h(m.Button, { disabled: true }, "Save"));
    expect(button().getAttribute("data-state")).toBe("disabled");
    rerender(h(m.Button, { loading: true }, "Save"));
    expect(button().getAttribute("data-state")).toBe("loading");
  });

  it("lets a composing component name the slot and own data-state", () => {
    const { rerender } = render(
      h(m.Button, { "data-slot": "dialog-trigger", "data-state": "closed" }, "Open"),
    );
    expect(button().getAttribute("data-slot")).toBe("dialog-trigger");
    expect(button().getAttribute("data-state")).toBe("closed");
    rerender(h(m.Button, { "data-slot": "dialog-trigger", "data-state": "open", loading: true }, "Open"));
    expect(button().getAttribute("data-state")).toBe("open");
  });
});
