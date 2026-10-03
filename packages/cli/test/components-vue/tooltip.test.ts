// @vitest-environment jsdom
/**
 * Tooltip behavior for the Vue target; mirrors test/components/tooltip.test.tsx.
 * Timing is tested with fake timers and synchronous fireEvent, awaiting
 * Vue's (microtask) render flush after each step. Vue's @pointerenter /
 * @pointerleave listen to the native events, so those are fired directly.
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick } from "vue";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "tooltip-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("tooltip", "tailwind", NAMESPACE, "vue");
});
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const flush = () => nextTick();
const advance = async (ms: number) => {
  vi.advanceTimersByTime(ms);
  await flush();
};
const hover = async (el: Element) => {
  await fireEvent.pointerEnter(el);
  await flush();
};
const unhover = async (el: Element, to: Element = document.body) => {
  await fireEvent.pointerLeave(el, { relatedTarget: to });
  await flush();
};
const focus = async (el: HTMLElement) => {
  el.focus();
  await flush();
};
const blur = async (el: HTMLElement) => {
  el.blur();
  await flush();
};

function renderTooltip(props: Record<string, unknown> = {}) {
  render({
    render: () =>
      h(m.Tooltip, props, () => [
        h(m.TooltipTrigger, {}, () => "Save"),
        h(m.TooltipContent, {}, () => "Saves your changes"),
      ]),
  });
  return {
    trigger: screen.getByRole("button", { name: "Save" }),
    content: document.querySelector<HTMLElement>('[role="tooltip"]')!,
  };
}

describe("Tooltip (vue)", () => {
  it("describes the trigger even while hidden", () => {
    const { trigger, content } = renderTooltip();
    expect(content).not.toBeVisible();
    expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
    expect(trigger).toHaveAccessibleDescription("Saves your changes");
  });

  it("opens after the hover delay", async () => {
    const { trigger, content } = renderTooltip();
    await hover(trigger);
    await advance(499);
    expect(content).not.toBeVisible();
    await advance(1);
    expect(content).toBeVisible();
    expect(content.getAttribute("data-state")).toBe("open");
  });

  it("does not open if the pointer leaves before the delay", async () => {
    const { trigger, content } = renderTooltip();
    await hover(trigger);
    await advance(200);
    await unhover(trigger);
    await advance(1000);
    expect(content).not.toBeVisible();
  });

  it("closes after a grace period, and stays open when the pointer moves into it", async () => {
    const { trigger, content } = renderTooltip({ openDelay: 0 });
    await hover(trigger);
    await advance(0);
    expect(content).toBeVisible();

    await unhover(trigger, content);
    await hover(content);
    await advance(1000);
    expect(content).toBeVisible();

    await unhover(content);
    await advance(149);
    expect(content).toBeVisible();
    await advance(1);
    expect(content).not.toBeVisible();
  });

  it("shows immediately on focus and hides on blur", async () => {
    const { trigger, content } = renderTooltip();
    await focus(trigger);
    expect(content).toBeVisible();
    await blur(trigger);
    expect(content).not.toBeVisible();
  });

  it("Escape hides it without dismissing an outer layer", async () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: outer, outside: false });
    const { trigger, content } = renderTooltip();

    await focus(trigger);
    await fireEvent.keyDown(document, { key: "Escape" });
    await flush();
    expect(content).not.toBeVisible();
    expect(outer).not.toHaveBeenCalled();

    // With the tooltip closed, Escape reaches the outer layer again
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    off();
  });

  it("hides when the trigger is pressed", async () => {
    const { trigger, content } = renderTooltip({ openDelay: 0 });
    await hover(trigger);
    await advance(0);
    await fireEvent.pointerDown(trigger);
    await flush();
    expect(content).not.toBeVisible();
  });

  it("reports open changes, not the initial state", async () => {
    const onOpenChange = vi.fn();
    const { trigger } = renderTooltip({ onOpenChange });
    await flush();
    expect(onOpenChange).not.toHaveBeenCalled();
    await focus(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await blur(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("asChild merges trigger behavior onto the user's element", async () => {
    const onFocus = vi.fn();
    const Fancy = defineComponent({
      setup(_, { slots }) {
        return () => h("button", { class: "fancy" }, slots.default?.());
      },
    });
    render({
      render: () =>
        h(m.Tooltip, {}, () => [
          h(m.TooltipTrigger, { asChild: true }, () => h(Fancy, { onFocus }, () => "Icon")),
          h(m.TooltipContent, {}, () => "Tip"),
        ]),
    });
    const trigger = screen.getByRole("button", { name: "Icon" });
    expect(trigger.className).toBe("fancy");
    expect(trigger).toHaveAccessibleDescription("Tip");

    await focus(trigger);
    expect(onFocus).toHaveBeenCalled();
    expect(document.querySelector('[role="tooltip"]')).toBeVisible();
  });
});
