// @vitest-environment jsdom
/** RadioGroup behavior for the Vue target; mirrors test/components/radio-group.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, onMounted, ref, type PropType } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { provideField, useFieldState, type FieldOptions } from "@defied/prism-vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "radio-group-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("radio-group", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const TestField = defineComponent({
  props: {
    label: { type: String, required: true },
    description: String,
    error: String,
    options: { type: Object as PropType<FieldOptions>, default: () => ({}) },
  },
  setup(props, { slots }) {
    const field = useFieldState(props.options);
    provideField(field);
    onMounted(() => {
      field.setHasDescription(!!props.description);
      field.setHasError(!!props.error);
    });
    return () => [
      h("span", { id: field.labelId }, props.label),
      slots.default?.(),
      props.description && h("p", { id: field.descriptionId }, props.description),
      props.error && h("p", { id: field.errorId }, props.error),
    ];
  },
});

const show = (node: () => unknown) => render({ render: node });

function group(props: Record<string, unknown>, values: string[], disabled: string[] = []) {
  return h(m.RadioGroup, { "aria-label": "Plan", ...props }, () =>
    values.map((v) => h(m.Radio, { key: v, value: v, disabled: disabled.includes(v) }, () => v)),
  );
}

const renderGroup = (props: Record<string, unknown> = {}, disabled: string[] = []) =>
  show(() => group(props, ["free", "pro", "team", "enterprise"], disabled));
const groupElement = (props: Record<string, unknown>) => group(props, ["free", "pro", "team"]);

const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const checked = () => (screen.getAllByRole("radio") as HTMLInputElement[]).find((r) => r.checked);

describe("RadioGroup (vue)", () => {
  it("renders native radios sharing one name inside a radiogroup", () => {
    renderGroup({ defaultValue: "pro" });
    const el = screen.getByRole("radiogroup", { name: "Plan" });
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios).toHaveLength(4);
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(radios.every((r) => r.type === "radio" && el.contains(r))).toBe(true);
    expect(checked()).toBe(radio("pro"));
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("selects on click and label click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ onValueChange });
    expect(checked()).toBeUndefined();
    await user.click(radio("team"));
    expect(checked()).toBe(radio("team"));
    await user.click(screen.getByText("free"));
    expect(checked()).toBe(radio("free"));
    expect(onValueChange.mock.calls).toEqual([["team"], ["free"]]);
  });

  it("native arrow keys move and select, wrapping and skipping disabled radios", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup({ defaultValue: "free", onValueChange }, ["team"]);
    await user.tab();
    expect(document.activeElement).toBe(radio("free"));
    await user.keyboard("[ArrowDown]");
    expect(document.activeElement).toBe(radio("pro"));
    expect(checked()).toBe(radio("pro"));
    await user.keyboard("[ArrowRight]");
    expect(checked()).toBe(radio("enterprise"));
    await user.keyboard("[ArrowDown]");
    expect(checked()).toBe(radio("free"));
    await user.keyboard("[ArrowUp]");
    expect(checked()).toBe(radio("enterprise"));
    await user.keyboard("[ArrowLeft]");
    expect(checked()).toBe(radio("pro"));
    expect(onValueChange.mock.calls).toEqual([["pro"], ["enterprise"], ["free"], ["enterprise"], ["pro"]]);
  });

  it("is a single tab stop", async () => {
    const user = userEvent.setup();
    show(() => h("div", [groupElement({ defaultValue: "pro" }), h("button", "after")]));
    await user.tab();
    expect(document.activeElement).toBe(radio("pro"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("controlled: reports but follows the value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const value = ref("free");
    show(() => groupElement({ value: value.value, onValueChange }));
    await user.click(radio("pro"));
    expect(onValueChange).toHaveBeenCalledWith("pro");
    expect(checked()).toBe(radio("free"));
    value.value = "pro";
    await nextTick();
    expect(checked()).toBe(radio("pro"));
  });

  it("v-model: update:modelValue drives the selection", async () => {
    const user = userEvent.setup();
    const value = ref<string | null>("free");
    show(() =>
      groupElement({ modelValue: value.value, "onUpdate:modelValue": (next: string) => (value.value = next) }),
    );
    await user.click(radio("team"));
    expect(value.value).toBe("team");
    expect(checked()).toBe(radio("team"));
  });

  it("disabled group and items can't be selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { unmount } = renderGroup({ onValueChange }, ["team"]);
    await user.click(radio("team"));
    expect(radio("team").disabled).toBe(true);
    unmount();
    renderGroup({ disabled: true, onValueChange });
    expect(screen.getByRole("radiogroup").getAttribute("aria-disabled")).toBe("true");
    await user.click(radio("free"));
    expect((screen.getAllByRole("radio") as HTMLInputElement[]).every((r) => r.disabled)).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("submits the selected value under its name", async () => {
    const user = userEvent.setup();
    show(() => h("form", { "data-testid": "f" }, [groupElement({ name: "plan" })]));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("plan")).toBeNull();
    await user.click(radio("team"));
    expect(new FormData(form).get("plan")).toBe("team");
  });

  it("horizontal orientation", () => {
    renderGroup({ orientation: "horizontal" });
    const el = screen.getByRole("radiogroup");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("takes its name, description, error, required and disabled from a Field", async () => {
    show(() =>
      h(
        TestField,
        {
          label: "Plan",
          description: "Billed monthly",
          error: "Pick one",
          options: { required: true, disabled: true },
        },
        () =>
          h(m.RadioGroup, null, () => [
            h(m.Radio, { value: "a" }, () => "A"),
            h(m.Radio, { value: "b" }, () => "B"),
          ]),
      ),
    );
    await nextTick();
    const el = screen.getByRole("radiogroup", { name: "Plan" });
    expect(el).toHaveAccessibleDescription("Billed monthly Pick one");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-required")).toBe("true");
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.every((r) => r.required && r.disabled)).toBe(true);
    expect(radios.every((r) => r.getAttribute("aria-invalid") === "true")).toBe(true);
  });
});
