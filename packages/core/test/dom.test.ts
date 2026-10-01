// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { getFocusable, hideOthers, lockScroll, nextIndex, onDismiss, trapFocus } from "../dom";

afterEach(() => {
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

function mount(html: string) {
  document.body.insertAdjacentHTML("beforeend", html);
}

const key = (k: string, init: KeyboardEventInit = {}) =>
  document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init }));

describe("getFocusable", () => {
  it("returns tabbable elements and skips disabled, hidden and tabindex=-1", () => {
    mount(`<div id="c">
      <button id="a">a</button>
      <button disabled>x</button>
      <input type="hidden" />
      <div tabindex="-1">x</div>
      <div hidden><button>x</button></div>
      <a href="#" id="b">b</a>
      <div tabindex="0" id="c2">c</div>
    </div>`);
    expect(getFocusable(document.getElementById("c")!).map((el) => el.id)).toEqual(["a", "b", "c2"]);
  });
});

describe("trapFocus", () => {
  it("focuses the first tabbable, wraps Tab and Shift+Tab, and restores focus", () => {
    mount(`<button id="outside">o</button><div id="trap"><button id="first">1</button><button id="last">2</button></div>`);
    const outside = document.getElementById("outside")!;
    outside.focus();

    const release = trapFocus(document.getElementById("trap")!);
    expect(document.activeElement?.id).toBe("first");

    document.getElementById("last")!.focus();
    key("Tab");
    expect(document.activeElement?.id).toBe("first");

    key("Tab", { shiftKey: true });
    expect(document.activeElement?.id).toBe("last");

    release();
    expect(document.activeElement).toBe(outside);
  });

  it("pulls escaped focus back inside", () => {
    mount(`<button id="outside">o</button><div id="trap"><button id="inner">1</button></div>`);
    const release = trapFocus(document.getElementById("trap")!);
    document.getElementById("outside")!.focus();
    expect(document.activeElement?.id).toBe("inner");
    release();
  });

  it("nests: only the innermost trap acts, and the outer one resumes", () => {
    mount(`<div id="outer"><button id="o1">o1</button><button id="open">open</button></div>
      <div id="inner"><button id="i1">i1</button><button id="i2">i2</button></div>`);
    const releaseOuter = trapFocus(document.getElementById("outer")!);
    document.getElementById("open")!.focus();
    const releaseInner = trapFocus(document.getElementById("inner")!);
    expect(document.activeElement?.id).toBe("i1");

    document.getElementById("i2")!.focus();
    key("Tab");
    expect(document.activeElement?.id).toBe("i1");

    releaseInner();
    expect(document.activeElement?.id).toBe("open");
    document.getElementById("i1")!.focus();
    expect(document.activeElement?.id).toBe("o1");
    releaseOuter();
  });

  it("focuses the container when it has nothing tabbable", () => {
    mount(`<div id="trap"><p>text</p></div>`);
    const trap = document.getElementById("trap")!;
    const release = trapFocus(trap);
    expect(document.activeElement).toBe(trap);
    expect(trap.getAttribute("tabindex")).toBe("-1");
    release();
  });
});

describe("onDismiss", () => {
  it("dismisses the topmost layer only, on Escape", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const offOuter = onDismiss({ inside: () => [], onDismiss: outer });
    const offInner = onDismiss({ inside: () => [], onDismiss: inner });

    key("Escape");
    expect(inner).toHaveBeenCalledWith("escape", expect.any(KeyboardEvent));
    expect(outer).not.toHaveBeenCalled();

    offInner();
    key("Escape");
    expect(outer).toHaveBeenCalledTimes(1);
    offOuter();
  });

  it("dismisses on pointer down outside, once per click, not inside", () => {
    mount(`<div id="layer"><button id="in">in</button></div><button id="out">out</button>`);
    const layer = document.getElementById("layer")!;
    const handler = vi.fn();
    const off = onDismiss({ inside: () => [layer], onDismiss: handler });

    document.getElementById("in")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    const out = document.getElementById("out")!;
    out.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    out.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]).toBe("outside");
    off();
  });

  it("one outside click closes only the top layer, even when it unregisters", () => {
    mount(`<button id="out">out</button>`);
    const outer = vi.fn();
    const offOuter = onDismiss({ inside: () => [], onDismiss: outer });
    const offInner = onDismiss({ inside: () => [], onDismiss: () => offInner() });

    const out = document.getElementById("out")!;
    out.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    out.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(outer).not.toHaveBeenCalled();
    offOuter();
  });

  it("respects escape: false and outside: false", () => {
    const handler = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: handler, escape: false, outside: false });
    key("Escape");
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    off();
  });
});

describe("lockScroll", () => {
  it("is reference-counted", () => {
    document.body.style.overflow = "auto";
    const a = lockScroll();
    const b = lockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    a();
    a(); // releasing twice is a no-op
    expect(document.body.style.overflow).toBe("hidden");
    b();
    expect(document.body.style.overflow).toBe("auto");
  });
});

describe("hideOthers", () => {
  it("hides siblings along the ancestor chain and restores them", () => {
    mount(`<main id="main">m</main><div id="already" aria-hidden="true"></div><div id="portal"><div id="modal"></div><span id="sib"></span></div>`);
    const restore = hideOthers(document.getElementById("modal")!);

    expect(document.getElementById("main")!.getAttribute("aria-hidden")).toBe("true");
    expect(document.getElementById("main")!.hasAttribute("inert")).toBe(true);
    expect(document.getElementById("sib")!.getAttribute("aria-hidden")).toBe("true");
    expect(document.getElementById("portal")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.getElementById("portal")!.hasAttribute("inert")).toBe(false);

    restore();
    expect(document.getElementById("main")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.getElementById("main")!.hasAttribute("inert")).toBe(false);
    expect(document.getElementById("sib")!.hasAttribute("aria-hidden")).toBe(false);
    // Was hidden before: untouched
    expect(document.getElementById("already")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps elements hidden until every nested modal restores", () => {
    mount(`<main id="main"></main><div id="a"></div><div id="b"></div>`);
    const restoreA = hideOthers(document.getElementById("a")!);
    const restoreB = hideOthers(document.getElementById("b")!);
    restoreB();
    expect(document.getElementById("main")!.getAttribute("aria-hidden")).toBe("true");
    restoreA();
    expect(document.getElementById("main")!.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("nextIndex", () => {
  const disabled = (set: number[]) => ({ isDisabled: (i: number) => set.includes(i) });

  it("moves with arrows and wraps by default", () => {
    expect(nextIndex("ArrowRight", 0, 3)).toBe(1);
    expect(nextIndex("ArrowRight", 2, 3)).toBe(0);
    expect(nextIndex("ArrowLeft", 0, 3)).toBe(2);
  });

  it("respects orientation, loop and rtl", () => {
    expect(nextIndex("ArrowDown", 0, 3)).toBeNull();
    expect(nextIndex("ArrowDown", 0, 3, { orientation: "vertical" })).toBe(1);
    expect(nextIndex("ArrowRight", 0, 3, { orientation: "vertical" })).toBeNull();
    expect(nextIndex("ArrowRight", 2, 3, { loop: false })).toBe(2);
    expect(nextIndex("ArrowLeft", 0, 3, { dir: "rtl" })).toBe(1);
  });

  it("skips disabled items and supports Home/End", () => {
    expect(nextIndex("ArrowRight", 0, 4, disabled([1, 2]))).toBe(3);
    expect(nextIndex("Home", 3, 4, disabled([0]))).toBe(1);
    expect(nextIndex("End", 0, 4, disabled([3]))).toBe(2);
  });

  it("ignores other keys and empty lists", () => {
    expect(nextIndex("a", 0, 3)).toBeNull();
    expect(nextIndex("ArrowRight", 0, 0)).toBeNull();
  });
});
