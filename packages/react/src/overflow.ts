import { useEffect, useState, type RefObject } from "react";
import { observeOverflow } from "@defied-labs/prism-core";

/** Whether the element overflows horizontally; tracks resizes. False on the server. */
export function useOverflow(ref: RefObject<HTMLElement | null>): boolean {
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const el = ref.current;
    return el ? observeOverflow(el, setOverflowing) : undefined;
  }, [ref]);
  return overflowing;
}
