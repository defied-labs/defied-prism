<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import { getFocusable, onDismiss, slotClass, variantData } from "@defied-prism/core";
import { usePresence } from "@defied-prism/vue";
import { slots } from "./styles";
import { usePopover } from "./context";

export interface PopoverContentProps {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Element to focus on open; defaults to the first focusable element, then the content. */
  initialFocus?: () => HTMLElement | null;
}

/**
 * A non-modal dialog: focus moves in on open, but is not trapped and the
 * page stays interactive. Escape (focus returns to the trigger) and outside
 * clicks close it; only the topmost layer closes, so it nests in dialogs.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps>(), {
  side: "bottom",
  align: "center",
  initialFocus: undefined,
});

const attrs = useAttrs();
const popover = usePopover("PopoverContent");
const contentRef = ref<HTMLDivElement | null>(null);
// Lingers with data-state="closed" while the exit animation plays
const { present, state } = usePresence(() => popover.open.value, contentRef);

let stop: (() => void) | undefined;
function activate(open: boolean) {
  stop?.();
  stop = undefined;
  const content = contentRef.value;
  if (!open || !content) return;
  const target = props.initialFocus?.() ?? getFocusable(content)[0] ?? content;
  target.focus();
  stop = onDismiss({
    inside: () => [content, popover.triggerEl.value],
    onDismiss: (reason) => {
      popover.open.value = false;
      if (reason === "escape") popover.triggerEl.value?.focus();
    },
  });
}

// After the DOM updates, like a React effect (an immediate watcher would run before mount)
onMounted(() => activate(popover.open.value));
watch(() => popover.open.value, activate, { flush: "post" });
onBeforeUnmount(() => stop?.());

// Read in the render, so attribute changes re-render the content
const contentAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = { side: props.side, align: props.align };
  return {
    ...rest,
    id: popover.contentId,
    role: "dialog",
    tabindex: -1,
    "data-state": state.value,
    "data-slot": "popover-content",
    ...variantData(variants),
    class: slotClass(slots, "content", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="present" ref="contentRef" v-bind="contentAttrs()"><slot /></div>
</template>
