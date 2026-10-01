// @vitest-environment jsdom
/**
 * Toast behavior for the Vue target; mirrors test/components/toast.test.tsx.
 * Timing is tested with fake timers and synchronous fireEvent. Vue renders
 * asynchronously, so `await flush()` stands in for React's act().
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick } from "vue";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "toast-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("toast", "tailwind", NAMESPACE, "vue");
});
beforeEach(() => vi.useFakeTimers());
afterEach(async () => {
  cleanup();
  m.toastStore.dismiss();
  await nextTick();
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const flush = () => nextTick();
const advance = async (ms: number) => {
  vi.advanceTimersByTime(ms);
  await flush();
};
const add = async (store: any, options: Record<string, unknown>) => {
  store.add(options);
  await flush();
};

function setup(props: Record<string, unknown> = {}) {
  const store = m.createToastStore();
  render({ render: () => h(m.Toaster, { store, ...props }) });
  return store;
}

const toasts = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-slot="toast-toast"]'));

describe("Toast (vue)", () => {
  it("renders a labelled region, even when empty", () => {
    setup();
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.getAttribute("data-position")).toBe("bottom-end");
    expect(toasts()).toHaveLength(0);
  });

  it("toast() adds to the default Toaster and returns an id", async () => {
    render({ render: () => h(m.Toaster) });
    const id: string = m.toast({ title: "Saved", description: "All good" });
    await flush();
    expect(typeof id).toBe("string");
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Saved");
    expect(el).toHaveTextContent("All good");
    m.toast.dismiss(id);
    await flush();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("uses role=status for most toasts and role=alert for danger", async () => {
    const store = setup();
    await add(store, { title: "Info", status: "info" });
    await add(store, { title: "Broke", status: "danger" });
    expect(screen.getByRole("status")).toHaveTextContent("Info");
    expect(screen.getByRole("alert")).toHaveTextContent("Broke");
    expect(screen.getByRole("alert").getAttribute("data-status")).toBe("danger");
  });

  it("auto-dismisses after its duration", async () => {
    const store = setup();
    await add(store, { title: "Bye", duration: 3000 });
    await advance(2999);
    expect(toasts()).toHaveLength(1);
    await advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("persistent toasts stay until dismissed", async () => {
    const store = setup();
    await add(store, { title: "Stay", duration: Infinity });
    await advance(60_000);
    expect(toasts()).toHaveLength(1);
  });

  it("pauses on hover and resumes with the remaining time on leave", async () => {
    const store = setup();
    await add(store, { title: "Hover me", duration: 3000 });
    await advance(1000);
    fireEvent.pointerOver(toasts()[0]!);
    await advance(10_000);
    expect(toasts()).toHaveLength(1);
    fireEvent.pointerOut(toasts()[0]!, { relatedTarget: document.body });
    await advance(1999);
    expect(toasts()).toHaveLength(1);
    await advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("pauses while focus is inside, and resumes when it leaves", async () => {
    const store = setup();
    await add(store, { title: "Focus", duration: 2000 });
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    close.focus();
    await flush();
    await advance(10_000);
    expect(toasts()).toHaveLength(1);
    close.blur();
    await flush();
    await advance(2000);
    expect(toasts()).toHaveLength(0);
  });

  it("stays paused while hovered even after focus leaves", async () => {
    const store = setup();
    await add(store, { title: "Both", duration: 1000 });
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    fireEvent.pointerOver(toasts()[0]!);
    close.focus();
    await flush();
    close.blur();
    await flush();
    await advance(5000);
    expect(toasts()).toHaveLength(1);
  });

  it("dismisses with the close button", async () => {
    const store = setup({ dismissLabel: "Close" });
    await add(store, { title: "Closable", duration: Infinity });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await flush();
    expect(toasts()).toHaveLength(0);
  });

  it("Escape dismisses the focused toast only, without closing an outer layer", async () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: outer, outside: false });
    const store = setup();
    await add(store, { id: "a", title: "A", duration: Infinity });
    await add(store, { id: "b", title: "B", duration: Infinity });
    const closeB = screen.getAllByRole("button", { name: "Dismiss notification" })[1]!;
    closeB.focus();
    await flush();
    fireEvent.keyDown(closeB, { key: "Escape" });
    await flush();
    expect(toasts().map((t) => t.textContent)).toEqual(["A"]);
    expect(outer).not.toHaveBeenCalled();
    // Focus moved to A; Escape dismisses it too
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await flush();
    expect(toasts()).toHaveLength(0);
    expect(outer).not.toHaveBeenCalled();
    // The toasts' layers are released once they're gone; Escape reaches the outer layer
    fireEvent.keyDown(document, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    off();
  });

  it("dismissing the focused toast moves focus to a neighbour, then back where it came from", async () => {
    const store = m.createToastStore();
    render({ render: () => h("div", null, [h("button", null, "Save"), h(m.Toaster, { store })]) });
    await add(store, { id: "a", title: "A", duration: Infinity });
    await add(store, { id: "b", title: "B", duration: Infinity });
    const save = screen.getByRole("button", { name: "Save" });
    save.focus();
    await flush();
    const [closeA, closeB] = screen.getAllByRole("button", { name: "Dismiss notification" });
    closeA!.focus();
    await flush();
    fireEvent.click(closeA!);
    await flush();
    expect(document.activeElement).toBe(closeB);
    fireEvent.click(closeB!);
    await flush();
    expect(toasts()).toHaveLength(0);
    expect(document.activeElement).toBe(save);
  });

  it("runs the action and dismisses", async () => {
    const onClick = vi.fn();
    const store = setup();
    await add(store, { title: "Deleted", action: { label: "Undo", onClick }, duration: Infinity });
    const action = screen.getByRole("button", { name: "Undo" });
    // Prism Button (sm) and IconButton (ghost, sm), keeping their slot names
    expect(action.getAttribute("data-slot")).toBe("toast-action");
    expect(action.getAttribute("data-size")).toBe("sm");
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    expect(close.getAttribute("data-slot")).toBe("toast-close");
    expect(close.getAttribute("data-variant")).toBe("ghost");
    expect(close.getAttribute("data-size")).toBe("sm");
    fireEvent.click(action);
    await flush();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toasts()).toHaveLength(0);
  });

  it("shows at most `max` toasts; queued ones appear, with a fresh timer, as others leave", async () => {
    const store = setup({ max: 2 });
    for (const title of ["one", "two", "three"]) await add(store, { title, duration: 1000 });
    expect(toasts().map((t) => t.textContent)).toEqual(["one", "two"]);
    await advance(1000);
    expect(toasts().map((t) => t.textContent)).toEqual(["three"]);
    await advance(999);
    expect(toasts()).toHaveLength(1);
    await advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("applies position and forwards class", () => {
    setup({ position: "top-center", class: "mine" });
    const region = screen.getByRole("region");
    expect(region.getAttribute("data-position")).toBe("top-center");
    expect(region.classList).toContain("mine");
  });

  it("useToast exposes toast, dismiss and the visible toasts", async () => {
    const store = m.createToastStore();
    let api: any;
    const Probe = defineComponent({
      setup() {
        api = m.useToast(store);
        return () => h("span", { "data-testid": "count" }, String(api.toasts.value.length));
      },
    });
    render({ render: () => h("div", {}, [h(Probe), h(m.Toaster, { store })]) });
    const id: string = api.toast({ title: "Hi", duration: Infinity });
    await flush();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    api.dismiss(id);
    await flush();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
