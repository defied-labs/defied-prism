import { createElement as h, useEffect, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FieldContext, useField, useFieldControlProps, useFieldState, type FieldOptions } from "../src";

function Field({ children, ...options }: FieldOptions & { children?: ReactNode }) {
  return h(FieldContext.Provider, { value: useFieldState(options) }, children);
}

function Description({ children }: { children?: ReactNode }) {
  const field = useField()!;
  useEffect(() => {
    field.setHasDescription(true);
    return () => field.setHasDescription(false);
  }, [field.setHasDescription]);
  return h("p", { id: field.descriptionId }, children);
}

function ErrorMessage({ children }: { children?: ReactNode }) {
  const field = useField()!;
  useEffect(() => {
    field.setHasError(true);
    return () => field.setHasError(false);
  }, [field.setHasError]);
  return h("p", { id: field.errorId }, children);
}

function Label({ children }: { children?: ReactNode }) {
  const field = useField()!;
  return h("label", { id: field.labelId, htmlFor: field.controlId }, children);
}

function Control(props: Record<string, unknown>) {
  return h("input", useFieldControlProps(props));
}

describe("field context", () => {
  it("labels and describes the control", () => {
    render(
      h(Field, { required: true }, h(Label, {}, "Email"), h(Control), h(Description, {}, "We never share it.")),
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAccessibleDescription("We never share it.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("an error message marks the control invalid and describes it", () => {
    render(
      h(
        Field,
        {},
        h(Label, {}, "Email"),
        h(Control, { "aria-describedby": "extra" }),
        h(Description, {}, "Work address."),
        h(ErrorMessage, {}, "Enter a valid email."),
        h("p", { id: "extra" }, "Extra."),
      ),
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Extra. Work address. Enter a valid email.");
  });

  it("explicit control props win; disabled flows down", () => {
    render(h(Field, { disabled: true, id: "fixed" }, h(Label, {}, "Name"), h(Control, { "aria-invalid": false })));
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.id).toBe("fixed");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("passes props through outside a Field", () => {
    render(h(Control, { id: "solo", "aria-label": "Solo" }));
    const input = screen.getByRole("textbox", { name: "Solo" });
    expect(input.id).toBe("solo");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
