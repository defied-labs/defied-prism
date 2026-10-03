// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied-prism/react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "checkbox";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("checkbox", "tailwind", NAMESPACE);
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

const box = () => screen.getByRole("checkbox") as HTMLInputElement;

describe("Checkbox", () => {
  it("is a real, labelled checkbox input", () => {
    render(h(m.Checkbox, null, "Accept"));
    expect(box().tagName).toBe("INPUT");
    expect(box().type).toBe("checkbox");
    expect(screen.getByRole("checkbox", { name: "Accept" })).toBe(box());
    expect(box().getAttribute("data-state")).toBe("unchecked");
  });

  it("uncontrolled: toggles on click, label click and Space", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(h(m.Checkbox, { onCheckedChange }, "Accept"));
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
    const { rerender } = render(h(m.Checkbox, { checked: false, onCheckedChange }, "A"));
    await user.click(box());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box().checked).toBe(false);
    rerender(h(m.Checkbox, { checked: true, onCheckedChange }, "A"));
    expect(box().checked).toBe(true);
  });

  it("defaultChecked", () => {
    render(h(m.Checkbox, { defaultChecked: true }, "A"));
    expect(box().checked).toBe(true);
  });

  it("indeterminate sets the DOM property and mixed semantics, and survives a toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(h(m.Checkbox, { indeterminate: true, onCheckedChange }, "All"));
    expect(box().indeterminate).toBe(true);
    expect(box().getAttribute("aria-checked")).toBe("mixed");
    expect(box().getAttribute("data-state")).toBe("indeterminate");
    await user.click(box());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    // Still indeterminate while the prop says so
    expect(box().indeterminate).toBe(true);
  });

  it("disabled: not toggled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(h(m.Checkbox, { disabled: true, onCheckedChange }, "A"));
    await user.click(box());
    expect(box().checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("composes the user's onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(h(m.Checkbox, { onChange }, "A"));
    await user.click(box());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(box().checked).toBe(true);
  });

  it("submits its value with the form only when checked", async () => {
    const user = userEvent.setup();
    render(h("form", { "data-testid": "f" }, h(m.Checkbox, { name: "terms", value: "yes" }, "A")));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("terms")).toBeNull();
    await user.click(box());
    expect(new FormData(form).get("terms")).toBe("yes");
  });

  it("takes id, description, error, required and disabled from a Field", () => {
    render(
      h(
        TestField,
        { label: "Newsletter", description: "Weekly", error: "Required", required: true, disabled: true },
        h(m.Checkbox),
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
    const { rerender } = render(h(m.Checkbox, null, "Accept"));
    const mark = () => document.querySelector('[data-part="mark"]');
    expect(mark()).toBeNull();
    await user.click(box());
    expect(mark()).toHaveAttribute("pathLength", "1");
    expect(mark()).toHaveAttribute("d", "M3.5 8.5l3 3 6-7");
    rerender(h(m.Checkbox, { indeterminate: true }, "Accept"));
    expect(mark()).toHaveAttribute("d", "M3.5 8h9");
  });
});
