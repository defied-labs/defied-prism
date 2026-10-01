// @vitest-environment jsdom
/**
 * Timing is tested with fake timers and synchronous fireEvent (see
 * tooltip.test.tsx). React's onPointerEnter/Leave come from pointerover/out.
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "toast";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("toast", "tailwind", NAMESPACE);
});
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  act(() => m.toastStore.dismiss());
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const add = (store: any, options: Record<string, unknown>) => act(() => void store.add(options));

function setup(props: Record<string, unknown> = {}) {
  const store = m.createToastStore();
  render(h(m.Toaster, { store, ...props }));
  return store;
}

const toasts = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-slot="toast-toast"]'));

describe("Toast", () => {
  it("renders a labelled region, even when empty", () => {
    setup();
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.getAttribute("data-position")).toBe("bottom-end");
    expect(toasts()).toHaveLength(0);
  });

  it("toast() adds to the default Toaster and returns an id", () => {
    render(h(m.Toaster));
    let id = "";
    act(() => void (id = m.toast({ title: "Saved", description: "All good" })));
    expect(typeof id).toBe("string");
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Saved");
    expect(el).toHaveTextContent("All good");
    act(() => m.toast.dismiss(id));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("uses role=status for most toasts and role=alert for danger", () => {
    const store = setup();
    add(store, { title: "Info", status: "info" });
    add(store, { title: "Broke", status: "danger" });
    expect(screen.getByRole("status")).toHaveTextContent("Info");
    expect(screen.getByRole("alert")).toHaveTextContent("Broke");
    expect(screen.getByRole("alert").getAttribute("data-status")).toBe("danger");
  });

  it("auto-dismisses after its duration", () => {
    const store = setup();
    add(store, { title: "Bye", duration: 3000 });
    advance(2999);
    expect(toasts()).toHaveLength(1);
    advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("persistent toasts stay until dismissed", () => {
    const store = setup();
    add(store, { title: "Stay", duration: Infinity });
    advance(60_000);
    expect(toasts()).toHaveLength(1);
  });

  it("pauses on hover and resumes with the remaining time on leave", () => {
    const store = setup();
    add(store, { title: "Hover me", duration: 3000 });
    advance(1000);
    fireEvent.pointerOver(toasts()[0]!);
    advance(10_000);
    expect(toasts()).toHaveLength(1);
    fireEvent.pointerOut(toasts()[0]!, { relatedTarget: document.body });
    advance(1999);
    expect(toasts()).toHaveLength(1);
    advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("pauses while focus is inside, and resumes when it leaves", () => {
    const store = setup();
    add(store, { title: "Focus", duration: 2000 });
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    act(() => close.focus());
    advance(10_000);
    expect(toasts()).toHaveLength(1);
    act(() => close.blur());
    advance(2000);
    expect(toasts()).toHaveLength(0);
  });

  it("stays paused while hovered even after focus leaves", () => {
    const store = setup();
    add(store, { title: "Both", duration: 1000 });
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    fireEvent.pointerOver(toasts()[0]!);
    act(() => close.focus());
    act(() => close.blur());
    advance(5000);
    expect(toasts()).toHaveLength(1);
  });

  it("dismisses with the close button", () => {
    const store = setup({ dismissLabel: "Close" });
    add(store, { title: "Closable", duration: Infinity });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(toasts()).toHaveLength(0);
  });

  it("Escape dismisses the focused toast only, without closing an outer layer", () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: outer, outside: false });
    const store = setup();
    add(store, { id: "a", title: "A", duration: Infinity });
    add(store, { id: "b", title: "B", duration: Infinity });
    const closeB = screen.getAllByRole("button", { name: "Dismiss notification" })[1]!;
    act(() => closeB.focus());
    fireEvent.keyDown(closeB, { key: "Escape" });
    expect(toasts().map((t) => t.textContent)).toEqual(["A"]);
    expect(outer).not.toHaveBeenCalled();
    // Focus moved to A; Escape dismisses it too
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(toasts()).toHaveLength(0);
    expect(outer).not.toHaveBeenCalled();
    // The toasts' layers are released once they're gone; Escape reaches the outer layer
    fireEvent.keyDown(document, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    off();
  });

  it("dismissing the focused toast moves focus to a neighbour, then back where it came from", () => {
    const store = m.createToastStore();
    render(h("div", null, h("button", null, "Save"), h(m.Toaster, { store })));
    add(store, { id: "a", title: "A", duration: Infinity });
    add(store, { id: "b", title: "B", duration: Infinity });
    const save = screen.getByRole("button", { name: "Save" });
    act(() => save.focus());
    const [closeA, closeB] = screen.getAllByRole("button", { name: "Dismiss notification" });
    act(() => closeA!.focus());
    fireEvent.click(closeA!);
    expect(document.activeElement).toBe(closeB);
    fireEvent.click(closeB!);
    expect(toasts()).toHaveLength(0);
    expect(document.activeElement).toBe(save);
  });

  it("runs the action and dismisses", () => {
    const onClick = vi.fn();
    const store = setup();
    add(store, { title: "Deleted", action: { label: "Undo", onClick }, duration: Infinity });
    const action = screen.getByRole("button", { name: "Undo" });
    // Prism Button (sm) and IconButton (ghost, sm), keeping their slot names
    expect(action.getAttribute("data-slot")).toBe("toast-action");
    expect(action.getAttribute("data-size")).toBe("sm");
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    expect(close.getAttribute("data-slot")).toBe("toast-close");
    expect(close.getAttribute("data-variant")).toBe("ghost");
    expect(close.getAttribute("data-size")).toBe("sm");
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toasts()).toHaveLength(0);
  });

  it("shows at most `max` toasts; queued ones appear, with a fresh timer, as others leave", () => {
    const store = setup({ max: 2 });
    for (const title of ["one", "two", "three"]) add(store, { title, duration: 1000 });
    expect(toasts().map((t) => t.textContent)).toEqual(["one", "two"]);
    advance(1000);
    expect(toasts().map((t) => t.textContent)).toEqual(["three"]);
    advance(999);
    expect(toasts()).toHaveLength(1);
    advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("applies position and forwards className", () => {
    setup({ position: "top-center", className: "mine" });
    const region = screen.getByRole("region");
    expect(region.getAttribute("data-position")).toBe("top-center");
    expect(region.classList).toContain("mine");
  });

  it("useToast exposes toast, dismiss and the visible toasts", () => {
    const store = m.createToastStore();
    let api: any;
    function Probe() {
      api = m.useToast(store);
      return h("span", { "data-testid": "count" }, String(api.toasts.length));
    }
    render(h("div", {}, h(Probe), h(m.Toaster, { store })));
    let id = "";
    act(() => void (id = api.toast({ title: "Hi", duration: Infinity })));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    act(() => api.dismiss(id));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
