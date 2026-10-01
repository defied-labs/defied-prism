// @vitest-environment jsdom
/** Field behavior for the Vue target; mirrors test/components/field.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { useFieldControlProps, type FieldControlProps } from "@defied-prism/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "field-vue";
let f: Record<string, any>;
let Input: unknown;

beforeAll(async () => {
  f = await loadGenerated("field", "tailwind", NAMESPACE, "vue");
  ({ Input } = await loadGenerated("input", "tailwind", NAMESPACE, "vue"));
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

// Checkbox has no Vue target yet; this stand-in wires a native checkbox to
// the Field exactly the way every Prism control does.
const Checkbox = defineComponent(() => {
  const props = useFieldControlProps<FieldControlProps & { type: string }>({ type: "checkbox" });
  return () => h("input", props.value);
});

// Parts register with the Field on mount; Vue re-renders the control on the next tick
const show = async (node: () => unknown) => {
  const result = render({ render: node });
  await nextTick();
  return result;
};

describe("Field (vue)", () => {
  it("labels and describes a real Input", async () => {
    await show(() =>
      h(f.Field, { required: true }, () => [
        h(f.FieldLabel, null, () => "Email"),
        h(Input as any),
        h(f.FieldDescription, null, () => "Work address"),
      ]),
    );
    const box = screen.getByRole("textbox", { name: "Email" });
    const desc = screen.getByText("Work address");
    expect(box.getAttribute("aria-describedby")).toBe(desc.id);
    expect(box).toHaveProperty("required", true);
    expect(box.hasAttribute("aria-invalid")).toBe(false);
    const label = screen.getByText("Email").closest("label")!;
    expect(label.htmlFor).toBe(box.id);
    expect(label.id).toBeTruthy();
    expect(label.querySelector('[data-part="required-indicator"][aria-hidden="true"]')).not.toBeNull();
  });

  it("FieldError with content marks the control invalid and describes it; empty it does not", async () => {
    const error = ref("");
    await show(() =>
      h(f.Field, null, () => [
        h(f.FieldLabel, null, () => "Name"),
        h(Input as any),
        h(f.FieldDescription, null, () => "Full name"),
        h(f.FieldError, null, () => error.value),
        h("button", { onClick: () => (error.value = error.value ? "" : "Required") }, "toggle"),
      ]),
    );
    const box = screen.getByRole("textbox", { name: "Name" });
    const err = document.querySelector('[data-slot="field-error"]')!;
    expect(err.getAttribute("aria-live")).toBe("polite");
    expect(box.hasAttribute("aria-invalid")).toBe(false);
    expect(box.getAttribute("aria-describedby")).not.toContain(err.id);

    const user = userEvent.setup();
    await user.click(screen.getByText("toggle"));
    expect(err.textContent).toBe("Required");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("aria-describedby")!.split(" ")).toEqual([screen.getByText("Full name").id, err.id]);
    expect(document.querySelector('[data-slot="field"]')!.getAttribute("data-invalid")).toBe("true");
    await user.click(screen.getByText("toggle"));
    expect(box.hasAttribute("aria-invalid")).toBe(false);
    expect(box.getAttribute("aria-describedby")).toBe(screen.getByText("Full name").id);
  });

  it("unmounting the description removes it from aria-describedby", async () => {
    const desc = ref(true);
    const { rerender } = await show(() =>
      h(f.Field, null, () => [
        h(f.FieldLabel, null, () => "A"),
        h(Input as any),
        desc.value && h(f.FieldDescription, null, () => "d"),
      ]),
    );
    expect(screen.getByRole("textbox").hasAttribute("aria-describedby")).toBe(true);
    desc.value = false;
    await rerender({});
    expect(screen.getByRole("textbox").hasAttribute("aria-describedby")).toBe(false);
  });

  it("invalid, disabled and controlId props reach a real Checkbox", async () => {
    await show(() =>
      h(f.Field, { invalid: true, disabled: true, controlId: "terms" }, () => [
        h(Checkbox),
        h(f.FieldLabel, null, () => "Accept terms"),
      ]),
    );
    const box = screen.getByRole("checkbox", { name: "Accept terms" }) as HTMLInputElement;
    expect(box.id).toBe("terms");
    expect(box.disabled).toBe(true);
    expect(box.getAttribute("aria-invalid")).toBe("true");
    await userEvent.setup().click(screen.getByText("Accept terms"));
    expect(box.checked).toBe(false);
  });

  it("FieldLabel's required overrides the Field", async () => {
    await show(() =>
      h(f.Field, { required: true }, () => [h(f.FieldLabel, { required: false }, () => "X"), h(Input as any)]),
    );
    expect(document.querySelector('[data-part="required-indicator"]')).toBeNull();
  });

  it("FieldGroup is a named group whose disabled disables its controls", async () => {
    await show(() =>
      h(f.FieldGroup, { legend: "Address", disabled: true }, () => [
        h(f.Field, null, () => [h(f.FieldLabel, null, () => "Street"), h(Input as any)]),
        h(f.Field, null, () => [h(f.FieldLabel, null, () => "City"), h(Input as any)]),
      ]),
    );
    const group = screen.getByRole("group", { name: "Address" });
    expect(group.tagName).toBe("FIELDSET");
    expect((screen.getByRole("textbox", { name: "Street" }) as HTMLInputElement).matches(":disabled")).toBe(true);
    expect((screen.getByRole("textbox", { name: "City" }) as HTMLInputElement).matches(":disabled")).toBe(true);
    // The Fields know too, so their labels and styles follow
    for (const field of document.querySelectorAll('[data-slot="field"]')) {
      expect(field.getAttribute("data-disabled")).toBe("true");
    }
  });

  it("each Field gets its own ids", async () => {
    await show(() =>
      h("div", null, [
        h(f.Field, null, () => [h(f.FieldLabel, null, () => "One"), h(Input as any)]),
        h(f.Field, null, () => [h(f.FieldLabel, null, () => "Two"), h(Input as any)]),
      ]),
    );
    expect(screen.getByRole("textbox", { name: "One" }).id).not.toBe(screen.getByRole("textbox", { name: "Two" }).id);
  });

  it("exposes the root element via template ref $el", async () => {
    const root = ref<any>(null);
    await show(() => h(f.Field, { ref: root }, () => "x"));
    expect(root.value.$el).toBe(document.querySelector('[data-slot="field"]'));
  });
});
