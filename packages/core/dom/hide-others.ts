const counts = new WeakMap<Element, number>();

/**
 * Makes everything except `element` (and its ancestors) inert: removed from
 * the tab order and hidden from assistive technology, so keyboard and screen
 * reader users stay inside a modal. Sets both `inert` and `aria-hidden`
 * (the latter for engines without inert support). Reference-counted per
 * element for nested modals. Returns the undo function.
 */
export function hideOthers(element: Element): () => void {
  const hidden: Element[] = [];
  let node: Element | null = element;
  while (node?.parentElement && node !== node.ownerDocument.body) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || sibling.tagName === "SCRIPT") continue;
      const count = counts.get(sibling) ?? 0;
      // Already hidden by someone else: leave it alone
      if (count === 0 && (sibling.hasAttribute("inert") || sibling.getAttribute("aria-hidden") === "true")) {
        continue;
      }
      if (count === 0) {
        sibling.setAttribute("aria-hidden", "true");
        sibling.setAttribute("inert", "");
      }
      counts.set(sibling, count + 1);
      hidden.push(sibling);
    }
    node = node.parentElement;
  }

  return () => {
    for (const sibling of hidden) {
      const count = (counts.get(sibling) ?? 1) - 1;
      counts.set(sibling, count);
      if (count === 0) {
        sibling.removeAttribute("aria-hidden");
        sibling.removeAttribute("inert");
      }
    }
  };
}
