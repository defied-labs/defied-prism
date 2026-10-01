// @vitest-environment jsdom
/** Input behavior for the Vue target; mirrors test/components/input.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref, watchEffect } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { provideField, useFieldState } from "@defied-prism/vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "input-vue";
let m: Record<string, any>;
let f: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("input", "tailwind", NAMESPACE, "vue");
  f = await loadGenerated("field", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

/** A hand-built Field on the adapter alone, like the React test's TestField. */
const TestField = defineComponent({
  props: {
    label: { type: String, required: true },
    description: String,
    error: String,
    required: Boolean,
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const field = useFieldState({ required: () => props.required, disabled: () => props.disabled });
    watchEffect(() => {
      field.setHasDescription(!!props.description);
      field.setHasError(!!props.error);
    });
    provideField(field);
    return () => [
      h("label", { id: field.labelId, for: field.controlId }, props.label),
      slots.default?.(),
      props.description && h("p", { id: field.descriptionId }, props.description),
      props.error && h("p", { id: field.errorId }, props.error),
    ];
  },
});

const show = async (node: () => unknown) => {
  const result = render({ render: node });
  // Field parts register on mount; the control picks them up on the next tick
  await nextTick();
  return result;
};
const box = () => screen.getByRole("textbox") as HTMLInputElement;

describe("Input (vue)", () => {
  it("is a bare control: no label, hint or error parts of its own", async () => {
    const { container } = await show(() => h(m.Input, { "aria-label": "Email", required: true }));
    expect(container.firstElementChild).toBe(box());
    expect(box()).toHaveAccessibleName("Email");
    expect(box().required).toBe(true);
    expect(box().hasAttribute("aria-invalid")).toBe(false);
  });

  it("aria-invalid styles it invalid without a Field", async () => {
    await show(() => h(m.Input, { "aria-label": "Email", "aria-invalid": true }));
    expect(box().getAttribute("aria-invalid")).toBe("true");
  });

  it("registry Field: label, description and required", async () => {
    await show(() =>
      h(f.Field, { required: true }, () => [
        h(f.FieldLabel, null, () => "Email"),
        h(m.Input),
        h(f.FieldDescription, null, () => "We never share it"),
      ]),
    );
    expect(screen.getByRole("textbox", { name: /Email/ })).toBe(box());
    expect(box()).toHaveAccessibleDescription("We never share it");
    expect(box().required).toBe(true);
    expect(box().hasAttribute("aria-invalid")).toBe(false);
  });

  it("registry Field: an error marks the input invalid and describes it", async () => {
    await show(() =>
      h(f.Field, null, () => [
        h(f.FieldLabel, null, () => "Email"),
        h(m.Input),
        h(f.FieldError, null, () => "Invalid email"),
      ]),
    );
    expect(box()).toHaveAccessibleDescription("Invalid email");
    expect(box().getAttribute("aria-invalid")).toBe("true");
  });

  it("registry Field: keeps the caller's id and aria-describedby", async () => {
    await show(() =>
      h("div", null, [
        h("p", { id: "x" }, "Extra"),
        h(f.Field, null, () => [
          h(f.FieldLabel, null, () => "Email"),
          h(m.Input, { id: "email", "aria-describedby": "x" }),
          h(f.FieldDescription, null, () => "Hint"),
        ]),
      ]),
    );
    expect(box().id).toBe("email");
    expect(box()).toHaveAccessibleDescription(/Extra/);
    expect(box()).toHaveAccessibleDescription(/Hint/);
  });

  it("inside a Field: the Field's id, label, description, error, disabled and required apply", async () => {
    await show(() =>
      h(
        TestField,
        { label: "Username", description: "Lowercase", error: "Taken", required: true, disabled: true },
        () => h(m.Input),
      ),
    );
    const el = screen.getByRole("textbox", { name: "Username" }) as HTMLInputElement;
    expect(el).toHaveAccessibleDescription("Lowercase Taken");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.required).toBe(true);
    expect(el.disabled).toBe(true);
    expect(el.getAttribute("data-state")).toBe("disabled");
  });

  it("inside a Field: its own aria-describedby and explicit props combine with the Field", async () => {
    await show(() =>
      h("div", null, [
        h("p", { id: "own" }, "3+ chars"),
        h(TestField, { label: "Username", description: "Lowercase", disabled: true }, () =>
          h(m.Input, { "aria-describedby": "own", disabled: false }),
        ),
      ]),
    );
    const el = screen.getByRole("textbox", { name: "Username" }) as HTMLInputElement;
    expect(el).toHaveAccessibleDescription("3+ chars Lowercase");
    expect(el.disabled).toBe(false);
  });

  it("tracks filled / focused state", async () => {
    const user = userEvent.setup();
    await show(() => h(m.Input, { "aria-label": "Email" }));
    expect(box().getAttribute("data-state")).toBe("empty");
    await user.type(box(), "a");
    expect(box().getAttribute("data-state")).toBe("focusedFilled");
  });

  it("v-model: reflects the bound value and emits each keystroke", async () => {
    const user = userEvent.setup();
    const value = ref("hi");
    await show(() =>
      h(m.Input, {
        "aria-label": "Email",
        modelValue: value.value,
        "onUpdate:modelValue": (next: string) => (value.value = next),
      }),
    );
    expect(box().value).toBe("hi");
    await user.type(box(), "!");
    expect(value.value).toBe("hi!");
    value.value = "reset";
    await nextTick();
    expect(box().value).toBe("reset");
  });

  it("follows aria-invalid when it changes after mount", async () => {
    const invalid = ref(false);
    await show(() => h(m.Input, { "aria-label": "Email", "aria-invalid": invalid.value || undefined }));
    expect(box().hasAttribute("aria-invalid")).toBe(false);
    invalid.value = true;
    await nextTick();
    expect(box().getAttribute("aria-invalid")).toBe("true");
  });
});
