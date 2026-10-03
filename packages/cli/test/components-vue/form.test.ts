// @vitest-environment jsdom
/** Form behavior for the Vue target; mirrors test/components/form.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, ref } from "vue";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "form-vue";
let m: Record<string, any>;
let f: Record<string, any>;
let input: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("form", "tailwind", NAMESPACE, "vue");
  f = await loadGenerated("field", "tailwind", NAMESPACE, "vue");
  input = await loadGenerated("input", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

const SignUp = defineComponent({
  props: { focusInvalid: { type: Boolean, default: undefined }, onValid: Function },
  setup(props) {
    const errors = ref<Record<string, string>>({});
    // v-model: the Vue Input re-renders `:value` from modelValue, so keep it bound
    const values = ref<Record<string, string>>({ name: "", email: "" });
    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget as HTMLFormElement);
      const next: Record<string, string> = {};
      if (!data.get("name")) next.name = "Name is required";
      if (!data.get("email")) next.email = "Email is required";
      errors.value = next;
      if (Object.keys(next).length === 0) props.onValid?.();
    };
    const field = (label: string, name: string) =>
      h(f.Field, null, () => [
        h(f.FieldLabel, null, () => label),
        h(input.Input, {
          name,
          modelValue: values.value[name],
          "onUpdate:modelValue": (value: string) => (values.value[name] = value),
        }),
        h(f.FieldError, null, () => errors.value[name]),
      ]);
    return () =>
      h(m.Form, { "aria-label": "Sign up", novalidate: true, onSubmit, focusInvalid: props.focusInvalid }, () => [
        field("Name", "name"),
        field("Email", "email"),
        h("button", { type: "submit" }, "Submit"),
      ]);
  },
});

describe("Form (vue)", () => {
  it("is a named form that forwards attributes and emits submit", async () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    show(() => h(m.Form, { "aria-label": "F", novalidate: true, onSubmit }, () => h("button", { type: "submit" }, "Go")));
    const form = screen.getByRole("form", { name: "F" }) as HTMLFormElement;
    expect(form.noValidate).toBe(true);
    await userEvent.setup().click(screen.getByText("Go"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("moves focus to the first invalid control after submit", async () => {
    const user = userEvent.setup();
    show(() => h(SignUp));
    await user.click(screen.getByText("Submit"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" })));
    expect(screen.getByText("Name is required")).toBeTruthy();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByText("Submit"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Email" })));
  });

  it("leaves focus alone when everything is valid", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    show(() => h(SignUp, { onValid }));
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "a@b.c");
    await user.click(screen.getByText("Submit"));
    expect(onValid).toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.activeElement).toBe(screen.getByText("Submit"));
  });

  it("focusInvalid=false opts out", async () => {
    const user = userEvent.setup();
    show(() => h(SignUp, { focusInvalid: false }));
    await user.click(screen.getByText("Submit"));
    await new Promise((r) => setTimeout(r, 10));
    expect(document.activeElement).toBe(screen.getByText("Submit"));
  });

  it("with novalidate, natively invalid controls are focused too", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Form, { "aria-label": "F", novalidate: true, onSubmit: (e: Event) => e.preventDefault() }, () => [
        h("input", { "aria-label": "ok" }),
        h("input", { "aria-label": "req", required: true }),
        h("button", { type: "submit" }, "Go"),
      ]),
    );
    await user.click(screen.getByText("Go"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("req")));
  });
});
