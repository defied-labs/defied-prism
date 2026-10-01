<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { onDismiss, slotClass, variantData } from "@defied-prism/core";
import type { Toast as ToastData, ToastStore } from "@defied-prism/core/components/toast";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { slots } from "./styles";
import type { Position, ReturnFocus } from "./context";

const props = defineProps<{
  toast: ToastData;
  store: ToastStore;
  position: Position;
  dismissLabel: string;
  /** Where focus came from when it entered the region. */
  returnFocus: ReturnFocus;
}>();

const variants = () => ({ position: props.position, status: props.toast.status });
const slot = (name: string) => ({
  "data-slot": `toast-${name}`,
  ...variantData(variants()),
  class: slotClass(slots, name, variants()),
});

const node = ref<HTMLDivElement | null>(null);

function dismiss() {
  const el = node.value;
  if (el?.contains(document.activeElement)) {
    // Keep keyboard users in the toasts: a neighbour, else where they came from
    const neighbour = (el.nextElementSibling ?? el.previousElementSibling) as HTMLElement | null;
    const target = neighbour?.querySelector<HTMLElement>("button") ?? props.returnFocus.current;
    target?.focus();
  }
  props.store.dismiss(props.toast.id);
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
  <!-- Danger is time-sensitive (assertive); everything else is polite -->
  <div
    ref="node"
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
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </IconButton>
  </div>
</template>
