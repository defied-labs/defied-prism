// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied-labs/prism-react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "radio-group";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("radio-group", "tailwind", NAMESPACE);
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
    h("span", { id: field.labelId }, label),
    children,
    description && h("p", { id: field.descriptionId }, description),
    error && h("p", { id: field.errorId }, error),
  );
}

function renderGroup(props: Record<string, unknown> = {}, disabled: string[] = []) {
  return render(
    h(
      m.RadioGroup,
      { "aria-label": "Plan", ...props },
      ...["free", "pro", "team", "enterprise"].map((v) =>
        h(m.Radio, { key: v, value: v, disabled: disabled.includes(v) }, v),
      ),
    ),
  );
}

const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const checked = () => (screen.getAllByRole("radio") as HTMLInputElement[]).find((r) => r.checked);

describe("RadioGroup", () => {
  it("renders native radios sharing one name inside a radiogroup", () => {
    renderGroup({ defaultValue: "pro" });
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios).toHaveLength(4);
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(radios.every((r) => r.type === "radio" && group.contains(r))).toBe(true);
    expect(checked()).toBe(radio("pro"));
    expect(group.getAttribute("aria-orientation")).toBe("vertical");
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
    render(
      h("div", null, renderGroupElement({ defaultValue: "pro" }), h("button", null, "after")),
    );
    await user.tab();
    expect(document.activeElement).toBe(radio("pro"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
  });

  it("controlled: reports but follows the value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(renderGroupElement({ value: "free", onValueChange }));
    await user.click(radio("pro"));
    expect(onValueChange).toHaveBeenCalledWith("pro");
    expect(checked()).toBe(radio("free"));
    rerender(renderGroupElement({ value: "pro", onValueChange }));
    expect(checked()).toBe(radio("pro"));
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
    render(h("form", { "data-testid": "f" }, renderGroupElement({ name: "plan" })));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("plan")).toBeNull();
    await user.click(radio("team"));
    expect(new FormData(form).get("plan")).toBe("team");
  });

  it("horizontal orientation", () => {
    renderGroup({ orientation: "horizontal" });
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-orientation")).toBe("horizontal");
    expect(group.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("takes its name, description, error, required and disabled from a Field", () => {
    render(
      h(
        TestField,
        { label: "Plan", description: "Billed monthly", error: "Pick one", required: true, disabled: true },
        h(m.RadioGroup, null, h(m.Radio, { value: "a" }, "A"), h(m.Radio, { value: "b" }, "B")),
      ),
    );
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toHaveAccessibleDescription("Billed monthly Pick one");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-required")).toBe("true");
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.every((r) => r.required && r.disabled)).toBe(true);
    expect(radios.every((r) => r.getAttribute("aria-invalid") === "true")).toBe(true);
  });
});

function renderGroupElement(props: Record<string, unknown>) {
  return h(
    m.RadioGroup,
    { "aria-label": "Plan", ...props },
    ...["free", "pro", "team"].map((v) => h(m.Radio, { key: v, value: v }, v)),
  );
}
