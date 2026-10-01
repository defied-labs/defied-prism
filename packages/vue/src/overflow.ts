import { onScopeDispose, ref, watch, type Ref } from "vue";
import { observeOverflow } from "@defied-prism/core";

/** Whether the element overflows horizontally; tracks resizes. False on the server. */
export function useOverflow(el: Readonly<Ref<HTMLElement | null | undefined>>): Ref<boolean> {
  const overflowing = ref(false);
  let stop: (() => void) | undefined;
  watch(
    el,
    (node) => {
      stop?.();
      stop = node ? observeOverflow(node, (value) => (overflowing.value = value)) : undefined;
    },
    { immediate: true, flush: "post" },
  );
  onScopeDispose(() => stop?.());
  return overflowing;
}
