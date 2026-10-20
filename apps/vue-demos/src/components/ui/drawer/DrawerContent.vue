<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import { hideOthers, lockScroll, onDismiss, slotClass, trapFocus, variantData } from "@defied/prism-core";
import { usePresence } from "@defied/prism-vue";
import { slots } from "./styles";
import { useDrawer } from "./context";

export interface DrawerContentProps {
  /** Edge of the viewport the drawer slides from. */
  side?: "left" | "right" | "top" | "bottom";
  /** Width (left/right) or height (top/bottom). */
  size?: "sm" | "md" | "lg" | "full";
  /** Close when clicking outside (default true). */
  closeOnOutsideClick?: boolean;
  /** Close on Escape (default true). */
  closeOnEscape?: boolean;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocus?: () => HTMLElement | null;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerContentProps>(), {
  side: "right",
  size: "md",
  closeOnOutsideClick: true,
  closeOnEscape: true,
  initialFocus: undefined,
});

const attrs = useAttrs();
const drawer = useDrawer("DrawerContent");
const contentRef = ref<HTMLDivElement | null>(null);
const portalRef = ref<HTMLDivElement | null>(null);
// Stays mounted, data-state="closed", while the exit animation plays
const { present, state } = usePresence(() => drawer.open.value, contentRef);

const variants = () => ({ side: props.side, size: props.size });

let cleanups: Array<() => void> = [];
function teardown() {
  for (const cleanup of cleanups.reverse()) cleanup();
  cleanups = [];
}

function activate(open: boolean, escape: boolean, outside: boolean) {
  teardown();
  const content = contentRef.value;
  const portal = portalRef.value;
  if (!open || !content || !portal) return;
  cleanups = [
    lockScroll(),
    hideOthers(portal),
    onDismiss({
      inside: () => [content],
      escape,
      outside,
      onDismiss: () => {
        drawer.open.value = false;
      },
    }),
    // Last, so focus moves in after the rest of the page is inert
    trapFocus(content, { initialFocus: props.initialFocus?.() }),
  ];
}

const deps = () => [drawer.open.value, props.closeOnEscape, props.closeOnOutsideClick] as const;
// After the DOM updates, like a React effect (an immediate watcher would run before mount)
onMounted(() => activate(...deps()));
watch(deps, (next) => activate(...next), { flush: "post" });
onBeforeUnmount(teardown);

// Read in the render, so attribute and state changes re-render the content
const contentAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: drawer.contentId,
    role: "dialog",
    "aria-modal": drawer.open.value ? ("true" as const) : undefined,
    "aria-labelledby": drawer.hasTitle.value && !attrs["aria-label"] ? drawer.titleId : undefined,
    "aria-describedby": drawer.hasDescription.value ? drawer.descriptionId : undefined,
    tabindex: -1,
    "data-state": state.value,
    "data-slot": "drawer-content",
    ...variantData(variants()),
    class: slotClass(slots, "content", variants(), normalizeClass(className)),
  };
};

const overlayAttrs = () => ({
  "aria-hidden": "true" as const,
  "data-state": state.value,
  "data-slot": "drawer-overlay",
  ...variantData(variants()),
  class: slotClass(slots, "overlay", variants()),
});
</script>

<template>
  <Teleport to="body">
    <div v-if="present" ref="portalRef">
      <div v-bind="overlayAttrs()" />
      <div ref="contentRef" v-bind="contentAttrs()"><slot /></div>
    </div>
  </Teleport>
</template>
