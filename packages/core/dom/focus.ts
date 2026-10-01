const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

function isHidden(el: Element, root: Element): boolean {
  for (let node: Element | null = el; node && node !== root.parentElement; node = node.parentElement) {
    if (node.hasAttribute("hidden") || node.hasAttribute("inert")) return true;
    const style = (node as HTMLElement).style;
    if (style && (style.display === "none" || style.visibility === "hidden")) return true;
  }
  return false;
}

/** Tabbable elements inside `container`, in DOM order. */
export function getFocusable(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.tabIndex >= 0 && !isHidden(el, container),
  );
}

/** Active traps; only the topmost one acts, so nested modals don't fight over focus. */
const traps: HTMLElement[] = [];
const isTopTrap = (container: HTMLElement) => traps[traps.length - 1] === container;

export interface FocusTrapOptions {
  /** Element to focus on activation; defaults to the first tabbable, then the container. */
  initialFocus?: HTMLElement | null;
  /** Return focus to the previously focused element on release (default true). */
  restoreFocus?: boolean;
}

/**
 * Keeps keyboard focus inside `container` until the returned function is
 * called. Tab / Shift+Tab wrap around; focus that escapes (e.g. a click on
 * the page) is pulled back. Traps nest: an inner trap suspends the outer one
 * until it is released.
 */
export function trapFocus(container: HTMLElement, options: FocusTrapOptions = {}): () => void {
  const doc = container.ownerDocument;
  const previouslyFocused = doc.activeElement as HTMLElement | null;

  const focusFirst = () => {
    const target = options.initialFocus ?? getFocusable(container)[0] ?? container;
    if (target === container && !container.hasAttribute("tabindex")) {
      container.setAttribute("tabindex", "-1");
    }
    target.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !isTopTrap(container)) return;
    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = doc.activeElement;
    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !container.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    if (isTopTrap(container) && !container.contains(event.target as Node)) focusFirst();
  };

  traps.push(container);
  doc.addEventListener("keydown", onKeyDown, true);
  doc.addEventListener("focusin", onFocusIn);
  focusFirst();

  return () => {
    const index = traps.lastIndexOf(container);
    if (index !== -1) traps.splice(index, 1);
    doc.removeEventListener("keydown", onKeyDown, true);
    doc.removeEventListener("focusin", onFocusIn);
    if (options.restoreFocus !== false && previouslyFocused?.isConnected) {
      previouslyFocused.focus();
    }
  };
}
