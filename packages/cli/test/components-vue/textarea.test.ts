// @vitest-environment jsdom
/** Textarea behavior for the Vue target; mirrors test/components/textarea.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref, watchEffect } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { provideField, useFieldState } from "@defied-prism/vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "textarea-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("textarea", "tailwind", NAMESPACE, "vue");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
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
const box = () => screen.getByRole("textbox") as HTMLTextAreaElement;

describe("Textarea (vue)", () => {
  it("is a multi-line textbox with variant data", async () => {
    await show(() => h(m.Textarea, { "aria-label": "Bio", resize: "none", fullWidth: true }));
    expect(box().tagName).toBe("TEXTAREA");
    expect(box().getAttribute("data-resize")).toBe("none");
    expect(box().getAttribute("data-full-width")).toBe("true");
    expect(box().getAttribute("data-variant")).toBe("outlined");
  });

  it("uncontrolled typing, composed onInput, multi-line", async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    const onUpdate = vi.fn();
    await show(() => h(m.Textarea, { "aria-label": "Bio", onInput, "onUpdate:modelValue": onUpdate }));
    await user.type(box(), "one{Enter}two");
    expect(box().value).toBe("one\ntwo");
    expect(onInput).toHaveBeenCalledTimes(7);
    expect(onUpdate).toHaveBeenLastCalledWith("one\ntwo");
  });

  it("uncontrolled: keeps typed text across re-renders (focus, typing, blur)", async () => {
    const user = userEvent.setup();
    await show(() => h(m.Textarea, { "aria-label": "Notes" }));
    await user.type(box(), "hello");
    await user.tab();
    await nextTick();
    expect(box().value).toBe("hello");
  });

  it("v-model: the bound value wins", async () => {
    const user = userEvent.setup();
    const value = ref("");
    await show(() =>
      h(m.Textarea, {
        "aria-label": "Bio",
        modelValue: value.value.toUpperCase(),
        "onUpdate:modelValue": (next: string) => (value.value = next),
      }),
    );
    await user.type(box(), "hi");
    expect(box().value).toBe("HI");
  });

  it("autoResize sets the height to the content height", async () => {
    const user = userEvent.setup();
    let scrollHeight = 40;
    vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight);
    await show(() => h(m.Textarea, { "aria-label": "Bio", autoResize: true }));
    expect(box().style.height).toBe("40px");
    expect(box().style.overflow).toBe("hidden");
    scrollHeight = 96;
    await user.type(box(), "x");
    expect(box().style.height).toBe("96px");
  });

  it("autoResize follows a controlled value", async () => {
    let scrollHeight = 40;
    vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight);
    const value = ref("a");
    await show(() => h(m.Textarea, { "aria-label": "Bio", autoResize: true, modelValue: value.value }));
    scrollHeight = 120;
    value.value = "a\nb\nc";
    await nextTick();
    expect(box().style.height).toBe("120px");
  });

  it("without autoResize the height is left alone", async () => {
    const user = userEvent.setup();
    await show(() => h(m.Textarea, { "aria-label": "Bio" }));
    await user.type(box(), "x");
    expect(box().style.height).toBe("");
  });

  it("disabled", async () => {
    const user = userEvent.setup();
    await show(() => h(m.Textarea, { "aria-label": "Bio", disabled: true }));
    await user.type(box(), "x");
    expect(box().value).toBe("");
    expect(box().disabled).toBe(true);
  });

  it("submits with the form", async () => {
    const user = userEvent.setup();
    await show(() => h("form", { "data-testid": "f" }, h(m.Textarea, { "aria-label": "Bio", name: "bio" })));
    await user.type(box(), "hello");
    expect(new FormData(screen.getByTestId("f") as HTMLFormElement).get("bio")).toBe("hello");
  });

  it("takes id, description, error, required and disabled from a Field; explicit props win", async () => {
    await show(() =>
      h("div", null, [
        h("p", { id: "extra" }, "Extra"),
        h(TestField, { label: "Bio", description: "Markdown", error: "Too long", required: true }, () =>
          h(m.Textarea, { "aria-describedby": "extra" }),
        ),
      ]),
    );
    const el = screen.getByRole("textbox", { name: "Bio" }) as HTMLTextAreaElement;
    expect(el).toHaveAccessibleDescription("Extra Markdown Too long");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.required).toBe(true);
    cleanup();
    await show(() => h(TestField, { label: "Bio", disabled: true }, () => h(m.Textarea, { disabled: false })));
    expect(box().disabled).toBe(false);
  });
});
