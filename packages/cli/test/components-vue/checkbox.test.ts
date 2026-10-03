// @vitest-environment jsdom
/** Checkbox behavior for the Vue target; mirrors test/components/checkbox.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref, watchEffect } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { provideField, useFieldState } from "@defied-prism/vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "checkbox-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("checkbox", "tailwind", NAMESPACE, "vue");
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
const box = () => screen.getByRole("checkbox") as HTMLInputElement;

describe("Checkbox (vue)", () => {
  it("is a real, labelled checkbox input", async () => {
    await show(() => h(m.Checkbox, null, () => "Accept"));
    expect(box().tagName).toBe("INPUT");
    expect(box().type).toBe("checkbox");
    expect(screen.getByRole("checkbox", { name: "Accept" })).toBe(box());
    expect(box().getAttribute("data-state")).toBe("unchecked");
  });

  it("uncontrolled: toggles on click, label click and Space", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    await show(() => h(m.Checkbox, { onCheckedChange }, () => "Accept"));
    await user.click(box());
    expect(box().checked).toBe(true);
    expect(box().getAttribute("data-state")).toBe("checked");
    expect(document.querySelector('[data-part="indicator"]')).not.toBeNull();
    await user.click(screen.getByText("Accept"));
    expect(box().checked).toBe(false);
    expect(document.querySelector('[data-part="indicator"]')).toBeNull();
    box().focus();
    await user.keyboard("[Space]");
    expect(box().checked).toBe(true);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("controlled: reports but follows the checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const checked = ref(false);
    await show(() => h(m.Checkbox, { checked: checked.value, onCheckedChange }, () => "A"));
    await user.click(box());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box().checked).toBe(false);
    checked.value = true;
    await nextTick();
    expect(box().checked).toBe(true);
  });

  it("v-model", async () => {
    const user = userEvent.setup();
    const on = ref(false);
    await show(() =>
      h(m.Checkbox, { modelValue: on.value, "onUpdate:modelValue": (v: boolean) => (on.value = v) }, () => "A"),
    );
    await user.click(box());
    expect(on.value).toBe(true);
    await nextTick();
    expect(box().checked).toBe(true);
  });

  it("defaultChecked", async () => {
    await show(() => h(m.Checkbox, { defaultChecked: true }, () => "A"));
    expect(box().checked).toBe(true);
  });

  it("indeterminate sets the DOM property and mixed semantics, and survives a toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    await show(() => h(m.Checkbox, { indeterminate: true, onCheckedChange }, () => "All"));
    expect(box().indeterminate).toBe(true);
    expect(box().getAttribute("aria-checked")).toBe("mixed");
    expect(box().getAttribute("data-state")).toBe("indeterminate");
    await user.click(box());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await nextTick();
    // Still indeterminate while the prop says so
    expect(box().indeterminate).toBe(true);
  });

  it("disabled: not toggled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    await show(() => h(m.Checkbox, { disabled: true, onCheckedChange }, () => "A"));
    await user.click(box());
    expect(box().checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("composes the user's onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await show(() => h(m.Checkbox, { onChange }, () => "A"));
    await user.click(box());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(box().checked).toBe(true);
  });

  it("labelClass styles the label, class styles the box", async () => {
    await show(() => h(m.Checkbox, { class: "box-x", labelClass: "label-x" }, () => "A"));
    expect(box().classList.contains("box-x")).toBe(true);
    expect(document.querySelector('[data-slot="checkbox-label"]')!.classList.contains("label-x")).toBe(true);
  });

  it("submits its value with the form only when checked", async () => {
    const user = userEvent.setup();
    await show(() => h("form", { "data-testid": "f" }, h(m.Checkbox, { name: "terms", value: "yes" }, () => "A")));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("terms")).toBeNull();
    await user.click(box());
    expect(new FormData(form).get("terms")).toBe("yes");
  });

  it("takes id, description, error, required and disabled from a Field", async () => {
    await show(() =>
      h(
        TestField,
        { label: "Newsletter", description: "Weekly", error: "Required", required: true, disabled: true },
        () => h(m.Checkbox),
      ),
    );
    const el = screen.getByRole("checkbox", { name: "Newsletter" }) as HTMLInputElement;
    expect(el).toHaveAccessibleDescription("Weekly Required");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.required).toBe(true);
    expect(el.disabled).toBe(true);
  });

  it("draws a tick or a dash as a pathLength-normalised mark", async () => {
    const user = userEvent.setup();
    const indeterminate = ref(false);
    await show(() => h(m.Checkbox, { indeterminate: indeterminate.value }, () => "Accept"));
    const mark = () => document.querySelector('[data-part="mark"]');
    expect(mark()).toBeNull();
    await user.click(box());
    expect(mark()).toHaveAttribute("pathLength", "1");
    expect(mark()).toHaveAttribute("d", "M3.5 8.5l3 3 6-7");
    expect(mark()!.parentElement).toHaveAttribute("stroke-width", "2.5");
    indeterminate.value = true;
    await nextTick();
    expect(mark()).toHaveAttribute("d", "M3.5 8h9");
  });
});
