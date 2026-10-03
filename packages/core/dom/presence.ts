/**
 * Waits for the exit animation `el` is playing (the one its recipe sets for
 * `data-state="closed"`), then calls `done`. Calls `done` synchronously when
 * nothing animates: no animation, zero duration (reduced motion), or an
 * environment without CSS (tests). Returns a cleanup that cancels the wait.
 */
export function onExitComplete(el: HTMLElement, done: () => void): () => void {
  const view = el.ownerDocument.defaultView;
  const style = view?.getComputedStyle(el);
  const name = style?.animationName ?? "";
  const longest = name && name !== "none" ? longestAnimation(style!) : 0;
  if (longest <= 0) {
    done();
    return () => {};
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    done();
  };
  const onEnd = (event: AnimationEvent) => {
    if (event.target === el) finish();
  };
  el.addEventListener("animationend", onEnd);
  el.addEventListener("animationcancel", onEnd);
  // animationend never fires for detached or display:none elements
  const timer = setTimeout(finish, longest + 50);
  function cleanup() {
    el.removeEventListener("animationend", onEnd);
    el.removeEventListener("animationcancel", onEnd);
    clearTimeout(timer);
  }
  return () => {
    finished = true;
    cleanup();
  };
}

function toMs(value: string): number {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return value.trim().endsWith("ms") ? n : n * 1000;
}

function longestAnimation(style: CSSStyleDeclaration): number {
  const durations = style.animationDuration.split(",");
  const delays = style.animationDelay.split(",");
  return Math.max(0, ...durations.map((d, i) => toMs(d) + toMs(delays[i % delays.length] ?? "0s")));
}

/**
 * Offset from the viewport centre to the centre of `el`, as the
 * `--prism-zoom-x` / `--prism-zoom-y` variables `prism-zoom-in` reads, so a
 * centred panel can grow out of (and shrink back into) its trigger.
 */
export function zoomOriginVars(el: Element | null | undefined): Record<string, string> {
  const view = el?.ownerDocument.defaultView;
  if (!el || !view) return {};
  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) return {};
  const x = rect.left + rect.width / 2 - view.innerWidth / 2;
  const y = rect.top + rect.height / 2 - view.innerHeight / 2;
  return { "--prism-zoom-x": `${Math.round(x)}px`, "--prism-zoom-y": `${Math.round(y)}px`, "--prism-zoom-scale": "0.3" };
}
