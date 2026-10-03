<script setup lang="ts">
import { normalizeClass, normalizeStyle, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import {
  hideOthers,
  lockScroll,
  onDismiss,
  slotClass,
  trapFocus,
  variantData,
  zoomOriginVars,
} from "@defied/prism-core";
import { usePresence } from "@defied/prism-vue";
import { slots } from "./styles";
import { useDialog } from "./context";

export interface DialogContentProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Use "alertdialog" for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
  /** Close when clicking outside (default: true for dialog, false for alertdialog). */
  closeOnOutsideClick?: boolean;
  /** Close on Escape (default true). */
  closeOnEscape?: boolean;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocus?: () => HTMLElement | null;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DialogContentProps>(), {
  size: "md",
  role: "dialog",
  closeOnOutsideClick: undefined,
  closeOnEscape: true,
  initialFocus: undefined,
});

const attrs = useAttrs();
const dialog = useDialog("DialogContent");
const contentRef = ref<HTMLDivElement | null>(null);
const portalRef = ref<HTMLDivElement | null>(null);

// Grow out of whatever opened the dialog: the trigger, else the focused
// element (controlled opens). Captured once per open, shrinks back into it.
const origin = ref<Record<string, string>>({});
function captureOrigin() {
  if (typeof document === "undefined") return;
  origin.value = zoomOriginVars(dialog.trigger.current ?? document.activeElement);
  dialog.trigger.current = null;
}
if (dialog.open.value) captureOrigin();
watch(
  () => dialog.open.value,
  (isOpen) => {
    // Reopened mid-exit: keep the origin it is shrinking into
    if (isOpen && !contentRef.value) captureOrigin();
  },
  { flush: "sync" },
);
// Stays mounted, data-state="closed", while the exit animation plays
const { present, state } = usePresence(() => dialog.open.value, contentRef);

const variants = () => ({ size: props.size });
const closeOnOutside = () => props.closeOnOutsideClick ?? props.role !== "alertdialog";

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
        dialog.open.value = false;
      },
    }),
    // Last, so focus moves in after the rest of the page is inert
    trapFocus(content, { initialFocus: props.initialFocus?.() }),
  ];
}

const deps = () => [dialog.open.value, props.closeOnEscape, closeOnOutside()] as const;
// After the DOM updates, like a React effect (an immediate watcher would run before mount)
onMounted(() => activate(...deps()));
watch(deps, (next) => activate(...next), { flush: "post" });
onBeforeUnmount(teardown);

// Read in the render, so attribute and state changes re-render the content
const contentAttrs = () => {
  const { class: className, style, ...rest } = attrs;
  return {
    ...rest,
    id: dialog.contentId,
    role: props.role,
    "aria-modal": dialog.open.value ? ("true" as const) : undefined,
    "aria-labelledby": dialog.hasTitle.value && !attrs["aria-label"] ? dialog.titleId : undefined,
    "aria-describedby": dialog.hasDescription.value ? dialog.descriptionId : undefined,
    tabindex: -1,
    style: [origin.value, normalizeStyle(style)],
    "data-state": state.value,
    "data-slot": "dialog-content",
    ...variantData(variants()),
    class: slotClass(slots, "content", variants(), normalizeClass(className)),
  };
};

const overlayAttrs = () => ({
  "aria-hidden": "true" as const,
  "data-state": state.value,
  "data-slot": "dialog-overlay",
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
