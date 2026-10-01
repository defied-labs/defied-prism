let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

/**
 * Prevents the page from scrolling behind a modal. Reference-counted, so
 * nested modals only unlock when the last one closes. Compensates for the
 * scrollbar width to avoid layout shift.
 */
export function lockScroll(doc: Document = document): () => void {
  const body = doc.body;
  if (locks === 0) {
    const scrollbar = (doc.defaultView?.innerWidth ?? 0) - doc.documentElement.clientWidth;
    saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  locks++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks--;
    if (locks === 0 && saved) {
      body.style.overflow = saved.overflow;
      body.style.paddingRight = saved.paddingRight;
      saved = null;
    }
  };
}
