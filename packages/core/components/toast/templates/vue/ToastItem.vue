<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { onDismiss, slotClass, variantData } from "@defied-prism/core";
import { usePresence } from "@defied-prism/vue";
import type { Toast as ToastData, ToastStore } from "@defied-prism/core/components/toast";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { slots } from "./styles";
import type { Position, ReturnFocus } from "./context";

const props = defineProps<{
  toast: ToastData;
  /** False once dismissed: the toast plays its exit animation, then emits exited. */
  open: boolean;
  store: ToastStore;
  position: Position;
  dismissLabel: string;
  /** Where focus came from when it entered the region. */
  returnFocus: ReturnFocus;
}>();

const emit = defineEmits<{ exited: [id: string] }>();

const variants = () => ({ position: props.position, status: props.toast.status });
const slot = (name: string) => ({
  "data-slot": `toast-${name}`,
  ...variantData(variants()),
  class: slotClass(slots, name, variants()),
});

const node = ref<HTMLDivElement | null>(null);
const { present, state } = usePresence(() => props.open, node);
watch(present, (isPresent) => {
  if (!isPresent) emit("exited", props.toast.id);
});

const countdown = () => Number.isFinite(props.toast.duration) && props.toast.duration > 0;
const progressStyle = () => ({
  animationDuration: `${props.toast.duration}ms`,
  animationPlayState: !props.open || props.toast.pausedBy.length > 0 ? "paused" : "running",
});

function dismiss() {
  const el = node.value;
  if (el?.contains(document.activeElement)) {
    // Keep keyboard users in the toasts: a neighbour, else where they came from
    const neighbour = siblingToast(el);
    const target = neighbour?.querySelector<HTMLElement>("button") ?? props.returnFocus.current;
    target?.focus();
  }
  props.store.dismiss(props.toast.id);
}

/** The nearest toast that is not leaving: the next one, else the previous. */
function siblingToast(el: HTMLElement): HTMLElement | null {
  const live = (node: Element | null, step: (node: Element) => Element | null) => {
    while (node?.getAttribute("data-state") === "closed") node = step(node);
    return node as HTMLElement | null;
  };
  return (
    live(el.nextElementSibling, (n) => n.nextElementSibling) ??
    live(el.previousElementSibling, (n) => n.previousElementSibling)
  );
}

let escapeLayer: (() => void) | null = null;
function releaseEscape() {
  escapeLayer?.();
  escapeLayer = null;
}
// Release the Escape layer if the toast leaves while focused
onBeforeUnmount(releaseEscape);

const outside = (event: PointerEvent) => !node.value?.contains(event.relatedTarget as Node | null);

// Same semantics as React's onPointerEnter/Leave, which are built from pointerover/out
function onPointerOver(event: PointerEvent) {
  if (outside(event)) props.store.pause(props.toast.id, "hover");
}
function onPointerOut(event: PointerEvent) {
  if (outside(event)) props.store.resume(props.toast.id, "hover");
}

function onFocusIn() {
  props.store.pause(props.toast.id, "focus");
  // While focus is inside, Escape dismisses this toast as the topmost
  // layer (without closing a surrounding dialog or popover)
  escapeLayer ??= onDismiss({ inside: () => [], outside: false, onDismiss: dismiss });
}

function onFocusOut(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
    releaseEscape();
    props.store.resume(props.toast.id, "focus");
  }
}

function onAction() {
  props.toast.action?.onClick?.();
  dismiss();
}
</script>

<template>
  <div v-if="present" ref="node" v-bind="slot('item')" :data-state="state">
    <!-- Danger is time-sensitive (assertive); everything else is polite -->
    <div
      :role="toast.status === 'danger' ? 'alert' : 'status'"
      aria-atomic="true"
      v-bind="slot('toast')"
      @pointerover="onPointerOver"
      @pointerout="onPointerOut"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <div v-bind="slot('content')">
        <div v-if="toast.title" v-bind="slot('title')">{{ toast.title }}</div>
        <div v-if="toast.description" v-bind="slot('description')">{{ toast.description }}</div>
      </div>
      <Button
        v-if="toast.action"
        variant="outline"
        size="sm"
        v-bind="slot('action')"
        @click="onAction"
      >
        {{ toast.action.label }}
      </Button>
      <IconButton
        variant="ghost"
        size="sm"
        :aria-label="dismissLabel"
        v-bind="slot('close')"
        @click="dismiss"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </IconButton>
      <!-- Restarts when an update changes the duration -->
      <div
        v-if="countdown()"
        :key="toast.duration"
        aria-hidden="true"
        v-bind="slot('progress')"
        :style="progressStyle()"
      />
    </div>
  </div>
</template>
