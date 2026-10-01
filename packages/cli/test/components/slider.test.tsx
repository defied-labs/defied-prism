// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useEffect, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FieldContext, useFieldState, type FieldOptions } from "@defied-prism/react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "slider";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("slider", "tailwind", NAMESPACE);
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

const slider = () => screen.getByRole("slider");
const now = () => Number(slider().getAttribute("aria-valuenow"));

function mockTrack(rect: Partial<DOMRect>) {
  const track = document.querySelector<HTMLElement>('[data-slot="slider-track"]')!;
  track.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {}, ...rect }) as DOMRect;
}

describe("Slider", () => {
  it("exposes the slider role and value attributes", () => {
    render(h(m.Slider, { "aria-label": "Volume", defaultValue: 30, min: 10, max: 90 }));
    const el = screen.getByRole("slider", { name: "Volume" });
    expect(el.tabIndex).toBe(0);
    expect(el.getAttribute("aria-valuemin")).toBe("10");
    expect(el.getAttribute("aria-valuemax")).toBe("90");
    expect(el.getAttribute("aria-valuenow")).toBe("30");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-valuetext")).toBeNull();
    expect(el.style.getPropertyValue("--prism-slider-fraction")).toBe("0.25");
    expect(el.querySelector('[data-part="thumb"][aria-hidden="true"]')).not.toBeNull();
  });

  it("defaults to min and clamps out-of-range values", () => {
    const { unmount } = render(h(m.Slider, { "aria-label": "v", min: 5 }));
    expect(now()).toBe(5);
    unmount();
    render(h(m.Slider, { "aria-label": "v", value: 500 }));
    expect(now()).toBe(100);
  });

  it("keyboard: arrows step, PageUp/PageDown move 10 steps, Home/End jump", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(h(m.Slider, { "aria-label": "v", defaultValue: 50, step: 2, onValueChange }));
    slider().focus();
    await user.keyboard("[ArrowRight]");
    expect(now()).toBe(52);
    await user.keyboard("[ArrowUp]");
    expect(now()).toBe(54);
    await user.keyboard("[ArrowLeft][ArrowDown]");
    expect(now()).toBe(50);
    await user.keyboard("[PageUp]");
    expect(now()).toBe(70);
    await user.keyboard("[PageDown]");
    expect(now()).toBe(50);
    await user.keyboard("[End]");
    expect(now()).toBe(100);
    await user.keyboard("[ArrowRight]");
    expect(now()).toBe(100);
    await user.keyboard("[Home]");
    expect(now()).toBe(0);
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([52, 54, 52, 50, 70, 50, 100, 0]);
  });

  it("aria-valuetext from getValueText", async () => {
    const user = userEvent.setup();
    render(h(m.Slider, { "aria-label": "v", defaultValue: 20, getValueText: (v: number) => `${v}%` }));
    expect(slider().getAttribute("aria-valuetext")).toBe("20%");
    slider().focus();
    await user.keyboard("[ArrowRight]");
    expect(slider().getAttribute("aria-valuetext")).toBe("21%");
  });

  it("controlled: reports but follows the value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(h(m.Slider, { "aria-label": "v", value: 10, onValueChange }));
    slider().focus();
    await user.keyboard("[ArrowRight]");
    expect(onValueChange).toHaveBeenCalledWith(11);
    expect(now()).toBe(10);
    rerender(h(m.Slider, { "aria-label": "v", value: 11, onValueChange }));
    expect(now()).toBe(11);
  });

  it("pointer: press and drag on the track (snapped), commit on release", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(h(m.Slider, { "aria-label": "v", step: 5, onValueChange, onValueCommit }));
    mockTrack({ left: 100, width: 200 });
    const el = slider();
    el.setPointerCapture = vi.fn();
    el.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(el, { button: 0, pointerId: 1, clientX: 150 });
    expect(now()).toBe(25);
    expect(document.activeElement).toBe(el);
    expect(el.setPointerCapture).toHaveBeenCalledWith(1);

    fireEvent.pointerMove(el, { pointerId: 1, clientX: 233 });
    expect(now()).toBe(65); // 66.5% snapped to 5
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 999 });
    expect(now()).toBe(100);
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 999 });
    expect(onValueCommit).toHaveBeenCalledWith(100);
    expect(el.releasePointerCapture).toHaveBeenCalledWith(1);

    // Moving without a press does nothing
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 100 });
    expect(now()).toBe(100);
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([25, 65, 100]);
  });

  it("vertical: pointer measures from the bottom", () => {
    render(h(m.Slider, { "aria-label": "v", orientation: "vertical" }));
    expect(slider().getAttribute("aria-orientation")).toBe("vertical");
    mockTrack({ top: 0, height: 100 });
    slider().setPointerCapture = vi.fn();
    fireEvent.pointerDown(slider(), { button: 0, pointerId: 1, clientY: 20 });
    expect(now()).toBe(80);
  });

  it("disabled: not focusable, ignores keys and pointer", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(h(m.Slider, { "aria-label": "v", defaultValue: 50, disabled: true, onValueChange }));
    const el = slider();
    expect(el.tabIndex).toBe(-1);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    el.focus();
    await user.keyboard("[ArrowRight][End]");
    mockTrack({ left: 0, width: 100 });
    fireEvent.pointerDown(el, { button: 0, pointerId: 1, clientX: 10 });
    expect(now()).toBe(50);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("submits its value through a hidden input", async () => {
    const user = userEvent.setup();
    render(h("form", { "data-testid": "f" }, h(m.Slider, { "aria-label": "v", name: "volume", defaultValue: 40 })));
    const form = screen.getByTestId("f") as HTMLFormElement;
    expect(new FormData(form).get("volume")).toBe("40");
    slider().focus();
    await user.keyboard("[ArrowRight]");
    expect(new FormData(form).get("volume")).toBe("41");
  });

  it("takes its label, description, error and disabled from a Field", () => {
    render(
      h(
        TestField,
        { label: "Brightness", description: "0-100", error: "Too bright", disabled: true, required: true },
        h(m.Slider),
      ),
    );
    const el = screen.getByRole("slider", { name: "Brightness" });
    expect(el).toHaveAccessibleDescription("0-100 Too bright");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.hasAttribute("required")).toBe(false);
  });
});
