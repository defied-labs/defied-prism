// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied-labs/prism-react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "switch";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("switch", "tailwind", NAMESPACE);
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

const sw = () => screen.getByRole("switch");
const isOn = () => sw().getAttribute("aria-checked") === "true";

describe("Switch", () => {
  it("is a named button with role switch", () => {
    render(h(m.Switch, null, "Wi-Fi"));
    expect(sw().tagName).toBe("BUTTON");
    expect(sw()).toHaveAccessibleName("Wi-Fi");
    expect(sw().getAttribute("aria-checked")).toBe("false");
    expect(sw().getAttribute("data-state")).toBe("unchecked");
    expect(sw().getAttribute("type")).toBe("button");
  });

  it("uncontrolled: click, Space and Enter toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(h(m.Switch, { onCheckedChange }, "Wi-Fi"));
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
    const { rerender } = render(h(m.Switch, { checked: false, onCheckedChange }, "x"));
    await user.click(sw());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(isOn()).toBe(false);
    rerender(h(m.Switch, { checked: true, onCheckedChange }, "x"));
    expect(isOn()).toBe(true);
  });

  it("defaultChecked", () => {
    render(h(m.Switch, { defaultChecked: true }, "x"));
    expect(isOn()).toBe(true);
  });

  it("disabled: does not toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(h(m.Switch, { disabled: true, onCheckedChange }, "x"));
    await user.click(sw());
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(isOn()).toBe(false);
  });

  it("composes onClick and respects preventDefault", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    render(h(m.Switch, { onClick }, "x"));
    await user.click(sw());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(isOn()).toBe(false);
  });

  it("submits its value under name only when on, and doesn't submit the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    render(h("form", { "data-testid": "f", onSubmit }, h(m.Switch, { name: "wifi" }, "x")));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("wifi")).toBeNull();
    await user.click(sw());
    expect(new FormData(form).get("wifi")).toBe("on");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("size variant", () => {
    render(h(m.Switch, { size: "sm" }, "x"));
    expect(sw().getAttribute("data-size")).toBe("sm");
    expect(document.querySelector('[data-slot="switch-thumb"]')!.getAttribute("data-size")).toBe("sm");
  });

  it("takes its label, description, error, required and disabled from a Field", () => {
    render(
      h(
        TestField,
        { label: "Notifications", description: "Email only", error: "Required", required: true, disabled: true },
        h(m.Switch),
      ),
    );
    const el = screen.getByRole("switch", { name: "Notifications" }) as HTMLButtonElement;
    expect(el).toHaveAccessibleDescription("Email only Required");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-required")).toBe("true");
    expect(el.disabled).toBe(true);
  });
});
