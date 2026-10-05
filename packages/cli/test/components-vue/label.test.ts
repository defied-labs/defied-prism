// @vitest-environment jsdom
/** Label behavior for the Vue target; mirrors test/components/label.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { provideField, useField, useFieldState } from "@defied-labs/prism-vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "label-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("label", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

const Field = defineComponent({
  props: { required: Boolean, disabled: Boolean },
  setup(props, { slots }) {
    provideField(useFieldState({ required: () => props.required, disabled: () => props.disabled }));
    return () => h("div", null, slots.default?.());
  },
});
const FieldInput = defineComponent(() => {
  const field = useField()!;
  return () => h("input", { id: field.controlId });
});

const indicator = (label: Element) => label.querySelector('[data-part="required-indicator"]');

describe("Label (vue)", () => {
  it("labels a control with for", () => {
    show(() => h("div", null, [h(m.Label, { for: "email" }, () => "Email"), h("input", { id: "email" })]));
    expect(screen.getByRole("textbox", { name: "Email" })).toBeTruthy();
  });

  it("required: an aria-hidden asterisk that stays out of the name", () => {
    show(() =>
      h("div", null, [h(m.Label, { for: "email", required: true }, () => "Email"), h("input", { id: "email" })]),
    );
    const label = document.querySelector("label")!;
    expect(indicator(label)!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("textbox", { name: "Email" })).toBeTruthy();
  });

  it("disabled: dimmed look", () => {
    show(() => h(m.Label, { disabled: true }, () => "Email"));
    expect(document.querySelector("label")!.getAttribute("data-dimmed")).toBe("true");
  });

  it("inside a Field: wires id/for and inherits required/disabled", () => {
    show(() => h(Field, { required: true, disabled: true }, () => [h(m.Label, null, () => "Email"), h(FieldInput)]));
    const label = document.querySelector("label")!;
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(label.htmlFor).toBe(input.id);
    expect(label.id).toMatch(/-label$/);
    expect(indicator(label)).not.toBeNull();
    expect(label.getAttribute("data-dimmed")).toBe("true");
  });

  it("explicit props win over the Field", () => {
    show(() => h(Field, { required: true }, () => h(m.Label, { id: "l", for: "x", required: false }, () => "Email")));
    const label = document.querySelector("label")!;
    expect(label.id).toBe("l");
    expect(label.htmlFor).toBe("x");
    expect(indicator(label)).toBeNull();
  });
});
