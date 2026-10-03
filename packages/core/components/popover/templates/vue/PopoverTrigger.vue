<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { Button } from "../button";
import { elementOf, usePopover, type PopoverButtonProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverButtonProps>(), {
  asChild: false,
  variant: "outline",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const popover = usePopover("PopoverTrigger");

// Track the rendered element so Escape and PopoverClose can return focus to it
const triggerRef = ref<unknown>(null);
const sync = () => {
  popover.triggerEl.value = elementOf(triggerRef.value);
};
onMounted(sync);
onUpdated(sync);
onBeforeUnmount(() => {
  popover.triggerEl.value = null;
});

function onClick(event: MouseEvent) {
  emit("click", event);
  if (!event.defaultPrevented) popover.open.value = !popover.open.value;
}

// Read in the render, so state changes re-render the trigger
const triggerAttrs = () => ({
  ...attrs,
  "aria-haspopup": "dialog",
  "aria-expanded": popover.open.value ? "true" : "false",
  "aria-controls": popover.open.value ? popover.contentId : undefined,
  "data-state": popover.open.value ? "open" : "closed",
});
</script>

<template>
  <Slot v-if="props.asChild" ref="triggerRef" v-bind="triggerAttrs()" @click="onClick"><slot /></Slot>
  <Button
    v-else
    ref="triggerRef"
    data-slot="popover-trigger"
    v-bind="triggerAttrs()"
    :variant="props.variant"
    :size="props.size"
    :full-width="props.fullWidth"
    :loading="props.loading"
    :disabled="props.disabled"
    :type="props.type"
    @click="onClick"
  >
    <slot />
  </Button>
</template>
