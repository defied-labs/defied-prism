import { computed, onBeforeUnmount, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import { onExitComplete } from "@defied-labs/prism-core";

/**
 * Keeps an overlay mounted while its exit animation plays. Render the element
 * with `v-if="present"` and `data-state="state"`; when `open` turns false the
 * element stays with `data-state="closed"` until the animation its recipe
 * sets for `_closed` ends (immediately when nothing animates).
 */
export function usePresence(
  open: MaybeRefOrGetter<boolean>,
  el: Ref<HTMLElement | null | undefined>,
): { present: ComputedRef<boolean>; state: ComputedRef<"open" | "closed"> } {
  const lingering = ref(toValue(open));
  let cancel = () => {};

  watch(
    () => toValue(open),
    (isOpen) => {
      cancel();
      if (isOpen) lingering.value = true;
    },
    { flush: "sync" },
  );
  // After the DOM shows data-state="closed", so the exit animation is running
  watch(
    () => [toValue(open), lingering.value] as const,
    ([isOpen, isLingering]) => {
      if (isOpen || !isLingering) return;
      const node = el.value;
      if (!node) {
        lingering.value = false;
        return;
      }
      cancel = onExitComplete(node, () => {
        lingering.value = false;
      });
    },
    { flush: "post" },
  );
  onBeforeUnmount(() => cancel());

  return {
    present: computed(() => toValue(open) || lingering.value),
    state: computed(() => (toValue(open) ? "open" : "closed")),
  };
}
