/**
 * Watches whether `el` overflows horizontally (content wider than the box),
 * e.g. a table in a narrow column. Calls `onChange` with the current state
 * immediately and whenever it changes. Returns the cleanup function.
 */
export function observeOverflow(el: HTMLElement, onChange: (overflowing: boolean) => void): () => void {
  let last: boolean | undefined;
  const measure = () => {
    const overflowing = el.scrollWidth > el.clientWidth;
    if (overflowing !== last) onChange((last = overflowing));
  };
  measure();

  const view = el.ownerDocument.defaultView;
  view?.addEventListener("resize", measure);
  let observer: ResizeObserver | undefined;
  if (view && "ResizeObserver" in view) {
    observer = new ResizeObserver(measure);
    observer.observe(el);
    // The content resizing (rows added, columns sorted) matters too
    for (const child of el.children) observer.observe(child);
  }
  return () => {
    view?.removeEventListener("resize", measure);
    observer?.disconnect();
  };
}
