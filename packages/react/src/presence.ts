import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { onExitComplete } from "@defied-prism/core";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * Keeps an overlay mounted while its exit animation plays. Render the element
 * while `present`, with `data-state={state}`; when `open` turns false the
 * element stays with `data-state="closed"` until the animation its recipe
 * sets for `_closed` ends (immediately when nothing animates).
 */
export function usePresence(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
): { present: boolean; state: "open" | "closed" } {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  useIsomorphicLayoutEffect(() => {
    if (open || !present) return;
    const el = ref.current;
    if (!el) {
      setPresent(false);
      return;
    }
    return onExitComplete(el, () => setPresent(false));
  }, [open, present]);

  return { present: open || present, state: open ? "open" : "closed" };
}
