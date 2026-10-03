// @vitest-environment jsdom
/** Switch behavior for the Vue target; mirrors test/components/switch.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref, watchEffect } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { provideField, useFieldState } from "@defied-prism/vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "switch-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("switch", "tailwind", NAMESPACE, "vue");
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
const sw = () => screen.getByRole("switch") as HTMLButtonElement;
const isOn = () => sw().getAttribute("aria-checked") === "true";

describe("Switch (vue)", () => {
  it("is a named button with role switch", async () => {
    await show(() => h(m.Switch, null, () => "Wi-Fi"));
    expect(sw().tagName).toBe("BUTTON");
    expect(sw()).toHaveAccessibleName("Wi-Fi");
    expect(sw().getAttribute("aria-checked")).toBe("false");
    expect(sw().getAttribute("data-state")).toBe("unchecked");
    expect(sw().getAttribute("type")).toBe("button");
  });

  it("uncontrolled: click, Space and Enter toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    await show(() => h(m.Switch, { onCheckedChange }, () => "Wi-Fi"));
    await user.click(sw());
    expect(isOn()).toBe(true);
    expect(sw().getAttribute("data-state")).toBe("checked");
    await user.keyboard("[Space]");
    expect(isOn()).toBe(false);
    await user.keyboard("[Enter]");
    expect(isOn()).toBe(true);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("controlled: reports but follows the checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const checked = ref(false);
    await show(() => h(m.Switch, { checked: checked.value, onCheckedChange }, () => "x"));
    await user.click(sw());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(isOn()).toBe(false);
    checked.value = true;
    await nextTick();
    expect(isOn()).toBe(true);
  });

  it("v-model", async () => {
    const user = userEvent.setup();
    const on = ref(false);
    await show(() =>
      h(m.Switch, { modelValue: on.value, "onUpdate:modelValue": (v: boolean) => (on.value = v) }, () => "x"),
    );
    await user.click(sw());
    expect(on.value).toBe(true);
    expect(isOn()).toBe(true);
    on.value = false;
    await nextTick();
    expect(isOn()).toBe(false);
  });

  it("defaultChecked", async () => {
    await show(() => h(m.Switch, { defaultChecked: true }, () => "x"));
    expect(isOn()).toBe(true);
  });

  it("disabled: does not toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    await show(() => h(m.Switch, { disabled: true, onCheckedChange }, () => "x"));
    await user.click(sw());
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(isOn()).toBe(false);
  });

  it("composes onClick and respects preventDefault", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: Event) => e.preventDefault());
    await show(() => h(m.Switch, { onClick }, () => "x"));
    await user.click(sw());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(isOn()).toBe(false);
  });

  it("submits its value under name only when on, and doesn't submit the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    await show(() => h("form", { "data-testid": "f", onSubmit }, h(m.Switch, { name: "wifi" }, () => "x")));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("wifi")).toBeNull();
    await user.click(sw());
    expect(new FormData(form).get("wifi")).toBe("on");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("size variant", async () => {
    await show(() => h(m.Switch, { size: "sm" }, () => "x"));
    expect(sw().getAttribute("data-size")).toBe("sm");
    expect(document.querySelector('[data-slot="switch-thumb"]')!.getAttribute("data-size")).toBe("sm");
  });

  it("takes its label, description, error, required and disabled from a Field", async () => {
    await show(() =>
      h(
        TestField,
        { label: "Notifications", description: "Email only", error: "Required", required: true, disabled: true },
        () => h(m.Switch),
      ),
    );
    const el = screen.getByRole("switch", { name: "Notifications" }) as HTMLButtonElement;
    expect(el).toHaveAccessibleDescription("Email only Required");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-required")).toBe("true");
    expect(el.disabled).toBe(true);
  });
});
