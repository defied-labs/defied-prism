<script setup lang="ts">
import { computed, normalizeClass, onBeforeUnmount, onMounted, provide, useAttrs, useId, watch } from "vue";
import { useMachine } from "@defied-labs/prism-vue";
import { isTooltipOpen, onDismiss, slotClass } from "@defied-labs/prism-core";
import { TooltipEvents, tooltipMachineDefinition } from "@defied-labs/prism-core/components/tooltip";
import { slots } from "./styles";
import { TooltipKey } from "./context";

export interface TooltipProps {
  /** Hover delay before showing, in ms (focus shows immediately). */
  openDelay?: number;
  /** Grace period before hiding, so the pointer can move into the tooltip. */
  closeDelay?: number;
  /** Start open (uncontrolled). */
  defaultOpen?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TooltipProps>(), {
  openDelay: 500,
  closeDelay: 150,
  defaultOpen: false,
});
const emit = defineEmits<{ openChange: [open: boolean] }>();

const attrs = useAttrs();
const { status, send } = useMachine(() =>
  props.defaultOpen
    ? { ...tooltipMachineDefinition, initialState: { status: "open" as const, data: {} } }
    : tooltipMachineDefinition,
);
const open = computed(() => isTooltipOpen(status.value));
const contentId = useId();

provide(TooltipKey, { open, contentId, send });

// The machine is pure; timers live in the adapter
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => [status.value, props.openDelay, props.closeDelay] as const,
  ([current, openDelay, closeDelay]) => {
    clearTimeout(timer);
    if (current !== "opening" && current !== "closing") return;
    timer = setTimeout(() => send(TooltipEvents.delayElapsed()), current === "opening" ? openDelay : closeDelay);
  },
);

// Escape closes the tooltip without closing a surrounding dialog
let stopDismiss: (() => void) | undefined;
function listen(isOpen: boolean) {
  stopDismiss?.();
  stopDismiss = isOpen
    ? onDismiss({ inside: () => [], outside: false, onDismiss: () => send(TooltipEvents.escape()) })
    : undefined;
}
onMounted(() => listen(open.value));
watch(open, (isOpen) => {
  listen(isOpen);
  emit("openChange", isOpen);
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  stopDismiss?.();
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "tooltip",
    "data-state": open.value ? "open" : "closed",
    class: slotClass(slots, "root", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <span v-bind="rootAttrs()"><slot /></span>
</template>
