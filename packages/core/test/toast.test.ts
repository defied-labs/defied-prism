import { describe, expect, it, vi } from "vitest";

import { createToastStore, withLeaving } from "../components/toast";

const ids = (list: { id: string }[]) => list.map((t) => t.id);

describe("toast store", () => {
  it("adds toasts with defaults and generated ids", () => {
    const store = createToastStore({ now: () => 0 });
    const id = store.add({ title: "Saved" });
    const [toast] = store.getSnapshot().visible;
    expect(toast).toMatchObject({ id, title: "Saved", status: "neutral", duration: 5000 });
    expect(store.add({ title: "Again" })).not.toBe(id);
  });

  it("updates in place when an existing id is added again", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", title: "Uploading" });
    store.add({ id: "a", title: "Uploaded", status: "success" });
    expect(store.getSnapshot().visible).toHaveLength(1);
    expect(store.getSnapshot().visible[0]).toMatchObject({ title: "Uploaded", status: "success" });
  });

  it("shows at most `max` toasts and promotes queued ones on dismiss", () => {
    const store = createToastStore({ max: 2, now: () => 0 });
    for (const id of ["a", "b", "c"]) store.add({ id });
    expect(ids(store.getSnapshot().visible)).toEqual(["a", "b"]);
    expect(ids(store.getSnapshot().queued)).toEqual(["c"]);
    // Queued toasts don't count down
    expect(ids(store.getTimers(0))).toEqual(["a", "b"]);

    store.dismiss("a", 1000);
    expect(ids(store.getSnapshot().visible)).toEqual(["b", "c"]);
    // The promoted toast gets its full duration from the moment it shows
    expect(store.getTimers(1000)).toEqual([
      { id: "b", delay: 4000 },
      { id: "c", delay: 5000 },
    ]);
  });

  it("setMax changes the visible window", () => {
    const store = createToastStore({ max: 1, now: () => 0 });
    store.add({ id: "a" });
    store.add({ id: "b" });
    store.setMax(3);
    expect(store.getMax()).toBe(3);
    expect(ids(store.getSnapshot().visible)).toEqual(["a", "b"]);
    store.setMax(0);
    expect(store.getMax()).toBe(1);
  });

  it("dismisses everything when no id is given", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({});
    store.add({});
    store.dismiss();
    expect(store.getSnapshot()).toEqual({ visible: [], queued: [] });
  });

  it("expresses auto-dismiss as timers and only expires when time is up", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", duration: 3000 });
    expect(store.getTimers(1000)).toEqual([{ id: "a", delay: 2000 }]);
    store.expire("a", 2999);
    expect(store.getSnapshot().visible).toHaveLength(1);
    store.expire("a", 3000);
    expect(store.getSnapshot().visible).toHaveLength(0);
  });

  it("persistent toasts have no timer", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", duration: Infinity });
    store.add({ id: "b", duration: 0 });
    expect(store.getTimers(0)).toEqual([]);
    store.expire("a", 1e9);
    expect(store.getSnapshot().visible).toHaveLength(2);
  });

  it("pauses and resumes, keeping the remaining time", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", duration: 5000 });
    store.pause("a", "hover", 2000);
    expect(store.getTimers(10_000)).toEqual([]);
    store.expire("a", 10_000);
    expect(store.getSnapshot().visible).toHaveLength(1);

    store.resume("a", "hover", 10_000);
    expect(store.getTimers(10_000)).toEqual([{ id: "a", delay: 3000 }]);
    store.expire("a", 13_000);
    expect(store.getSnapshot().visible).toHaveLength(0);
  });

  it("stays paused until every pause reason is released", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", duration: 5000 });
    store.pause("a", "hover", 1000);
    store.pause("a", "focus", 1500);
    store.pause("a", "focus", 1600); // idempotent
    store.resume("a", "hover", 2000);
    expect(store.getTimers(2000)).toEqual([]);
    expect(store.getSnapshot().visible[0]!.pausedBy).toEqual(["focus"]);
    store.resume("a", "focus", 4000);
    expect(store.getTimers(4000)).toEqual([{ id: "a", delay: 4000 }]);
  });

  it("a new duration restarts the countdown", () => {
    const store = createToastStore({ now: () => 0 });
    store.add({ id: "a", duration: 5000 });
    store.update("a", { duration: 8000 }, 4000);
    expect(store.getTimers(4000)).toEqual([{ id: "a", delay: 8000 }]);
    store.update("a", { title: "x" }, 5000);
    expect(store.getTimers(5000)).toEqual([{ id: "a", delay: 7000 }]);
  });

  it("notifies subscribers with a new snapshot and ignores no-ops", () => {
    const store = createToastStore({ now: () => 0 });
    const listener = vi.fn();
    const off = store.subscribe(listener);
    const before = store.getSnapshot();
    store.add({ id: "a" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).not.toBe(before);
    store.dismiss("missing");
    store.resume("a", "hover");
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.dismiss("a");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("uses the injected clock by default", () => {
    let now = 0;
    const store = createToastStore({ duration: 1000, now: () => now });
    store.add({ id: "a" });
    now = 400;
    expect(store.getTimers()).toEqual([{ id: "a", delay: 600 }]);
    now = 1000;
    store.expire("a");
    expect(store.getSnapshot().visible).toHaveLength(0);
  });
});

describe("withLeaving", () => {
  it("keeps leaving toasts where they were, between the visible ones", () => {
    const a = { id: "a" }, b = { id: "b" }, c = { id: "c" }, d = { id: "d" };
    expect(ids(withLeaving([a, b, c], [a, c, d]))).toEqual(["a", "b", "c", "d"]);
    expect(ids(withLeaving([a, b], []))).toEqual(["a", "b"]);
    expect(ids(withLeaving([], [a]))).toEqual(["a"]);
  });
});
