// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "field";
let f: Record<string, any>;
let input: Record<string, any>;
let checkbox: Record<string, any>;

beforeAll(async () => {
  f = await loadGenerated("field", "tailwind", NAMESPACE);
  input = await loadGenerated("input", "tailwind", NAMESPACE);
  checkbox = await loadGenerated("checkbox", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Field", () => {
  it("labels and describes a real Input", () => {
    render(
      h(
        f.Field,
        { required: true },
        h(f.FieldLabel, null, "Email"),
        h(input.Input, null),
        h(f.FieldDescription, null, "Work address"),
      ),
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
    function Demo() {
      const [error, setError] = useState("");
      return h(
        f.Field,
        null,
        h(f.FieldLabel, null, "Name"),
        h(input.Input, null),
        h(f.FieldDescription, null, "Full name"),
        h(f.FieldError, null, error),
        h("button", { onClick: () => setError(error ? "" : "Required") }, "toggle"),
      );
    }
    render(h(Demo));
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

  it("unmounting the description removes it from aria-describedby", () => {
    const tree = (desc: boolean) =>
      h(f.Field, null, h(f.FieldLabel, null, "A"), h(input.Input, null), desc && h(f.FieldDescription, null, "d"));
    const { rerender } = render(tree(true));
    expect(screen.getByRole("textbox").hasAttribute("aria-describedby")).toBe(true);
    rerender(tree(false));
    expect(screen.getByRole("textbox").hasAttribute("aria-describedby")).toBe(false);
  });

  it("invalid, disabled and controlId props reach a real Checkbox", async () => {
    render(
      h(
        f.Field,
        { invalid: true, disabled: true, controlId: "terms" },
        h(checkbox.Checkbox, null),
        h(f.FieldLabel, null, "Accept terms"),
      ),
    );
    const box = screen.getByRole("checkbox", { name: "Accept terms" }) as HTMLInputElement;
    expect(box.id).toBe("terms");
    expect(box.disabled).toBe(true);
    expect(box.getAttribute("aria-invalid")).toBe("true");
    await userEvent.setup().click(screen.getByText("Accept terms"));
    expect(box.checked).toBe(false);
  });

  it("FieldLabel's required overrides the Field", () => {
    render(h(f.Field, { required: true }, h(f.FieldLabel, { required: false }, "X"), h(input.Input, null)));
    expect(document.querySelector('[data-part="required-indicator"]')).toBeNull();
  });

  it("FieldGroup is a named group whose disabled disables its controls", () => {
    render(
      h(
        f.FieldGroup,
        { legend: "Address", disabled: true },
        h(f.Field, null, h(f.FieldLabel, null, "Street"), h(input.Input, null)),
        h(f.Field, null, h(f.FieldLabel, null, "City"), h(input.Input, null)),
      ),
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

  it("each Field gets its own ids", () => {
    render(
      h("div", null,
        h(f.Field, null, h(f.FieldLabel, null, "One"), h(input.Input, null)),
        h(f.Field, null, h(f.FieldLabel, null, "Two"), h(input.Input, null)),
      ),
    );
    expect(screen.getByRole("textbox", { name: "One" }).id).not.toBe(screen.getByRole("textbox", { name: "Two" }).id);
  });
});
