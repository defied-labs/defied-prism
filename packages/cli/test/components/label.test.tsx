// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { FieldContext, useField, useFieldState } from "@defied-prism/react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "label";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("label", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function Field({ children, ...options }: { children?: ReactNode; required?: boolean; disabled?: boolean }) {
  return h(FieldContext.Provider, { value: useFieldState(options) }, children);
}
function FieldInput() {
  const field = useField()!;
  return h("input", { id: field.controlId });
}

const indicator = (label: Element) => label.querySelector('[data-part="required-indicator"]');

describe("Label", () => {
  it("labels a control with htmlFor", () => {
    render(h("div", null, h(m.Label, { htmlFor: "email" }, "Email"), h("input", { id: "email" })));
    expect(screen.getByRole("textbox", { name: "Email" })).toBeTruthy();
  });

  it("required: an aria-hidden asterisk that stays out of the name", () => {
    render(
      h("div", null, h(m.Label, { htmlFor: "email", required: true }, "Email"), h("input", { id: "email" })),
    );
    const label = document.querySelector("label")!;
    expect(indicator(label)!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("textbox", { name: "Email" })).toBeTruthy();
  });

  it("disabled: dimmed look", () => {
    render(h(m.Label, { disabled: true }, "Email"));
    expect(document.querySelector("label")!.getAttribute("data-dimmed")).toBe("true");
  });

  it("inside a Field: wires id/htmlFor and inherits required/disabled", () => {
    render(h(Field, { required: true, disabled: true }, h(m.Label, null, "Email"), h(FieldInput)));
    const label = document.querySelector("label")!;
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(label.htmlFor).toBe(input.id);
    expect(label.id).toMatch(/-label$/);
    expect(indicator(label)).not.toBeNull();
    expect(label.getAttribute("data-dimmed")).toBe("true");
  });

  it("explicit props win over the Field", () => {
    render(h(Field, { required: true }, h(m.Label, { id: "l", htmlFor: "x", required: false }, "Email")));
    const label = document.querySelector("label")!;
    expect(label.id).toBe("l");
    expect(label.htmlFor).toBe("x");
    expect(indicator(label)).toBeNull();
  });
});
