// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied-prism/react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "input";
let m: Record<string, any>;
let f: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("input", "tailwind", NAMESPACE);
  f = await loadGenerated("field", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function TestField({
  label,
  description,
  error,
  children,
  ...options
}: FieldOptions & { label: string; description?: string; error?: string; children?: ReactNode }) {
  const field = useFieldState(options);
  const { setHasDescription, setHasError } = field;
  useEffect(() => {
    setHasDescription(!!description);
    setHasError(!!error);
  }, [description, error, setHasDescription, setHasError]);
  return h(
    FieldContext.Provider,
    { value: field },
    h("label", { id: field.labelId, htmlFor: field.controlId }, label),
    children,
    description && h("p", { id: field.descriptionId }, description),
    error && h("p", { id: field.errorId }, error),
  );
}

const box = () => screen.getByRole("textbox") as HTMLInputElement;

describe("Input", () => {
  it("is a bare control: no label, hint or error parts of its own", () => {
    const { container } = render(h(m.Input, { "aria-label": "Email", required: true }));
    expect(container.firstElementChild).toBe(box());
    expect(box()).toHaveAccessibleName("Email");
    expect(box().required).toBe(true);
    expect(box().hasAttribute("aria-invalid")).toBe(false);
  });

  it("aria-invalid styles it invalid without a Field", () => {
    render(h(m.Input, { "aria-label": "Email", "aria-invalid": true }));
    expect(box().getAttribute("aria-invalid")).toBe("true");
  });

  it("registry Field: label, description and required", () => {
    render(
      h(
        f.Field,
        { required: true },
        h(f.FieldLabel, null, "Email"),
        h(m.Input),
        h(f.FieldDescription, null, "We never share it"),
      ),
    );
    expect(screen.getByRole("textbox", { name: /Email/ })).toBe(box());
    expect(box()).toHaveAccessibleDescription("We never share it");
    expect(box().required).toBe(true);
    expect(box().hasAttribute("aria-invalid")).toBe(false);
  });

  it("registry Field: an error marks the input invalid and describes it", () => {
    render(
      h(
        f.Field,
        null,
        h(f.FieldLabel, null, "Email"),
        h(m.Input),
        h(f.FieldError, null, "Invalid email"),
      ),
    );
    expect(box()).toHaveAccessibleDescription("Invalid email");
    expect(box().getAttribute("aria-invalid")).toBe("true");
  });

  it("registry Field: keeps the caller's id and aria-describedby", () => {
    render(
      h(
        "div",
        null,
        h("p", { id: "x" }, "Extra"),
        h(
          f.Field,
          null,
          h(f.FieldLabel, null, "Email"),
          h(m.Input, { id: "email", "aria-describedby": "x" }),
          h(f.FieldDescription, null, "Hint"),
        ),
      ),
    );
    expect(box().id).toBe("email");
    expect(box()).toHaveAccessibleDescription(/Extra/);
    expect(box()).toHaveAccessibleDescription(/Hint/);
  });

  it("inside a Field: the Field's id, label, description, error, disabled and required apply", () => {
    render(
      h(
        TestField,
        { label: "Username", description: "Lowercase", error: "Taken", required: true, disabled: true },
        h(m.Input),
      ),
    );
    const el = screen.getByRole("textbox", { name: "Username" }) as HTMLInputElement;
    expect(el).toHaveAccessibleDescription("Lowercase Taken");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.required).toBe(true);
    expect(el.disabled).toBe(true);
    expect(el.getAttribute("data-state")).toBe("disabled");
  });

  it("inside a Field: its own aria-describedby and explicit props combine with the Field", () => {
    render(
      h(
        "div",
        null,
        h("p", { id: "own" }, "3+ chars"),
        h(TestField, { label: "Username", description: "Lowercase", disabled: true }, h(m.Input, { "aria-describedby": "own", disabled: false })),
      ),
    );
    const el = screen.getByRole("textbox", { name: "Username" }) as HTMLInputElement;
    expect(el).toHaveAccessibleDescription("3+ chars Lowercase");
    expect(el.disabled).toBe(false);
  });

  it("tracks filled / focused state", async () => {
    const user = userEvent.setup();
    render(h(m.Input, { "aria-label": "Email" }));
    expect(box().getAttribute("data-state")).toBe("empty");
    await user.type(box(), "a");
    expect(box().getAttribute("data-state")).toBe("focusedFilled");
  });
});
