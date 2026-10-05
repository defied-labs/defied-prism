// @vitest-environment jsdom
/**
 * Timing is tested with fake timers and synchronous fireEvent: Testing
 * Library's async user-event wrapper deadlocks under Vitest fake timers.
 * React's onPointerEnter/Leave are driven by pointerover/pointerout.
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, forwardRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-labs/prism-core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "tooltip";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("tooltip", "tailwind", NAMESPACE);
});
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const hover = (el: Element) => fireEvent.pointerOver(el);
const unhover = (el: Element, to: Element = document.body) =>
  fireEvent.pointerOut(el, { relatedTarget: to });
const focus = (el: HTMLElement) => act(() => el.focus());
const blur = (el: HTMLElement) => act(() => el.blur());

function renderTooltip(props: Record<string, unknown> = {}) {
  render(
    h(
      m.Tooltip,
      props,
      h(m.TooltipTrigger, {}, "Save"),
      h(m.TooltipContent, {}, "Saves your changes"),
    ),
  );
  return {
    trigger: screen.getByRole("button", { name: "Save" }),
    content: document.querySelector<HTMLElement>('[role="tooltip"]')!,
  };
}

describe("Tooltip", () => {
  it("describes the trigger even while hidden", () => {
    const { trigger, content } = renderTooltip();
    expect(content).not.toBeVisible();
    expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
    expect(trigger).toHaveAccessibleDescription("Saves your changes");
  });

  it("opens after the hover delay", () => {
    const { trigger, content } = renderTooltip();
    hover(trigger);
    advance(499);
    expect(content).not.toBeVisible();
    advance(1);
    expect(content).toBeVisible();
    expect(content.getAttribute("data-state")).toBe("open");
  });

  it("does not open if the pointer leaves before the delay", () => {
    const { trigger, content } = renderTooltip();
    hover(trigger);
    advance(200);
    unhover(trigger);
    advance(1000);
    expect(content).not.toBeVisible();
  });

  it("closes after a grace period, and stays open when the pointer moves into it", () => {
    const { trigger, content } = renderTooltip({ openDelay: 0 });
    hover(trigger);
    advance(0);
    expect(content).toBeVisible();

    unhover(trigger, content);
    hover(content);
    advance(1000);
    expect(content).toBeVisible();

    unhover(content);
    advance(149);
    expect(content).toBeVisible();
    advance(1);
    expect(content).not.toBeVisible();
  });

  it("shows immediately on focus and hides on blur", () => {
    const { trigger, content } = renderTooltip();
    focus(trigger);
    expect(content).toBeVisible();
    blur(trigger);
    expect(content).not.toBeVisible();
  });

  it("Escape hides it without dismissing an outer layer", () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: outer, outside: false });
    const { trigger, content } = renderTooltip();

    focus(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(content).not.toBeVisible();
    expect(outer).not.toHaveBeenCalled();

    // With the tooltip closed, Escape reaches the outer layer again
    fireEvent.keyDown(document, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    off();
  });

  it("hides when the trigger is pressed", () => {
    const { trigger, content } = renderTooltip({ openDelay: 0 });
    hover(trigger);
    advance(0);
    fireEvent.pointerDown(trigger);
    expect(content).not.toBeVisible();
  });

  it("reports open changes, not the initial state", () => {
    const onOpenChange = vi.fn();
    const { trigger } = renderTooltip({ onOpenChange });
    expect(onOpenChange).not.toHaveBeenCalled();
    focus(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    blur(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("asChild merges trigger behavior onto the user's element", () => {
    const onFocus = vi.fn();
    const Fancy = forwardRef<HTMLButtonElement, Record<string, unknown>>((props, ref) =>
      h("button", { ...props, ref, className: "fancy" }),
    );
    render(
      h(
        m.Tooltip,
        {},
        h(m.TooltipTrigger, { asChild: true }, h(Fancy, { onFocus }, "Icon")),
        h(m.TooltipContent, {}, "Tip"),
      ),
    );
    const trigger = screen.getByRole("button", { name: "Icon" });
    expect(trigger.className).toBe("fancy");
    expect(trigger).toHaveAccessibleDescription("Tip");

    focus(trigger);
    expect(onFocus).toHaveBeenCalled();
    expect(document.querySelector('[role="tooltip"]')).toBeVisible();
  });
});
