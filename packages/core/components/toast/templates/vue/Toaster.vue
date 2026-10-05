<script setup lang="ts">
import {
  normalizeClass,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  watch,
  watchEffect,
} from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { withLeaving, type Toast, type ToastStore } from "@defied-labs/prism-core/components/toast";
import { slots } from "./styles";
import { toastStore, useToasts } from "./toast";
import type { Position, ReturnFocus } from "./context";
import ToastItem from "./ToastItem.vue";

export interface ToasterProps {
  position?: Position;
  /** Maximum toasts visible at once; the rest wait in a queue. */
  max?: number;
  /** Accessible name of the region. */
  label?: string;
  /** Accessible name of each toast's dismiss button. */
  dismissLabel?: string;
  /** Defaults to the app-wide store used by `toast()`. */
  store?: ToastStore;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ToasterProps>(), {
  position: "bottom-end",
  max: undefined,
  label: "Notifications",
  dismissLabel: "Dismiss notification",
  store: () => toastStore,
});

const attrs = useAttrs();
const snapshot = useToasts(() => props.store);
const returnFocus: ReturnFocus = { current: null };

// Dismissed toasts stay rendered until their exit animation ends
const rendered = shallowRef<Toast[]>(snapshot.value.visible);
watch(
  () => snapshot.value.visible,
  (visible) => (rendered.value = withLeaving(rendered.value, visible)),
  { flush: "sync" },
);
const isOpen = (id: string) => snapshot.value.visible.some((t) => t.id === id);
function onExited(id: string) {
  rendered.value = rendered.value.filter((t) => t.id !== id || isOpen(id));
}

watchEffect(() => {
  if (props.max !== undefined) props.store.setMax(props.max);
});

// Timers as data -> real timers. Rescheduled whenever the toasts change.
watch(
  () => [snapshot.value.visible, props.store] as const,
  ([, store], _, onCleanup) => {
    const handles = store
      .getTimers()
      .map(({ id, delay }) => setTimeout(() => store.expire(id), delay));
    onCleanup(() => handles.forEach(clearTimeout));
  },
  // After the update, like React's effect: timers firing in the same tick all expire
  { immediate: true },
);

const variants = () => ({ position: props.position });

// Read in the render, so attribute changes re-render the region
const rootAttrs = () => {
  const { class: className, onFocus: _onFocus, ...rest } = attrs;
  return {
    role: "region",
    "aria-label": props.label,
    ...rest,
    "data-slot": "toast",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

// Like React's onFocus, which bubbles: runs for focus anywhere inside.
// A native listener: Vue skips a parent's handler for an event a child's
// Vue handler already saw in the same millisecond (it timestamps events).
const root = ref<HTMLDivElement | null>(null);
onMounted(() => root.value?.addEventListener("focusin", onFocusIn));
onBeforeUnmount(() => root.value?.removeEventListener("focusin", onFocusIn));

function onFocusIn(event: FocusEvent) {
  const onFocus = attrs.onFocus as ((event: FocusEvent) => void) | undefined;
  onFocus?.(event);
  const from = event.relatedTarget as HTMLElement | null;
  if (!(event.currentTarget as HTMLElement).contains(from)) returnFocus.current = from;
}
</script>

<template>
  <div ref="root" v-bind="rootAttrs()">
    <ToastItem
      v-for="item in rendered"
      :key="item.id"
      :toast="item"
      :open="isOpen(item.id)"
      :store="store"
      :position="position"
      :dismiss-label="dismissLabel"
      :return-focus="returnFocus"
      @exited="onExited"
    />
  </div>
</template>
