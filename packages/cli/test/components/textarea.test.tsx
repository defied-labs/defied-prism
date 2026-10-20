// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, useState, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied/prism-react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "textarea";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("textarea", "tailwind", NAMESPACE);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
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

const box = () => screen.getByRole("textbox") as HTMLTextAreaElement;

describe("Textarea", () => {
  it("is a multi-line textbox with variant data", () => {
    render(h(m.Textarea, { "aria-label": "Bio", resize: "none", fullWidth: true }));
    expect(box().tagName).toBe("TEXTAREA");
    expect(box().getAttribute("data-resize")).toBe("none");
    expect(box().getAttribute("data-full-width")).toBe("true");
    expect(box().getAttribute("data-variant")).toBe("outlined");
  });

  it("uncontrolled typing, composed onChange, multi-line", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(h(m.Textarea, { "aria-label": "Bio", onChange }));
    await user.type(box(), "one{Enter}two");
    expect(box().value).toBe("one\ntwo");
    expect(onChange).toHaveBeenCalledTimes(7);
  });

  it("controlled value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("");
      return h(m.Textarea, {
        "aria-label": "Bio",
        value: value.toUpperCase(),
        onChange: (e: { target: { value: string } }) => setValue(e.target.value),
      });
    }
    render(h(Controlled));
    await user.type(box(), "hi");
    expect(box().value).toBe("HI");
  });

  it("autoResize sets the height to the content height", async () => {
    const user = userEvent.setup();
    let scrollHeight = 40;
    vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight);
    render(h(m.Textarea, { "aria-label": "Bio", autoResize: true }));
    expect(box().style.height).toBe("40px");
    expect(box().style.overflow).toBe("hidden");
    scrollHeight = 96;
    await user.type(box(), "x");
    expect(box().style.height).toBe("96px");
  });

  it("without autoResize the height is left alone", async () => {
    const user = userEvent.setup();
    render(h(m.Textarea, { "aria-label": "Bio" }));
    await user.type(box(), "x");
    expect(box().style.height).toBe("");
  });

  it("disabled", async () => {
    const user = userEvent.setup();
    render(h(m.Textarea, { "aria-label": "Bio", disabled: true }));
    await user.type(box(), "x");
    expect(box().value).toBe("");
  });

  it("submits with the form", async () => {
    const user = userEvent.setup();
    render(h("form", { "data-testid": "f" }, h(m.Textarea, { "aria-label": "Bio", name: "bio" })));
    await user.type(box(), "hello");
    expect(new FormData(screen.getByTestId("f") as HTMLFormElement).get("bio")).toBe("hello");
  });

  it("takes id, description, error, required and disabled from a Field; explicit props win", () => {
    render(
      h(
        "div",
        null,
        h("p", { id: "extra" }, "Extra"),
        h(
          TestField,
          { label: "Bio", description: "Markdown", error: "Too long", required: true },
          h(m.Textarea, { "aria-describedby": "extra" }),
        ),
      ),
    );
    const el = screen.getByRole("textbox", { name: "Bio" }) as HTMLTextAreaElement;
    expect(el).toHaveAccessibleDescription("Extra Markdown Too long");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.required).toBe(true);
    cleanup();
    render(h(TestField, { label: "Bio", disabled: true }, h(m.Textarea, { disabled: false })));
    expect(box().disabled).toBe(false);
  });
});
