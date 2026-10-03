<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied/prism-vue";
import { Button } from "../button";
import { usePopover, type PopoverButtonProps } from "./context";

/** Closes the popover and returns focus to the trigger. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverButtonProps>(), {
  asChild: false,
  variant: "secondary",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const popover = usePopover("PopoverClose");

function onClick(event: MouseEvent) {
  emit("click", event);
  if (event.defaultPrevented) return;
  popover.open.value = false;
  popover.triggerEl.value?.focus();
}
</script>

<template>
  <Slot v-if="props.asChild" v-bind="attrs" @click="onClick"><slot /></Slot>
  <Button
    v-else
    data-slot="popover-close"
    v-bind="attrs"
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
