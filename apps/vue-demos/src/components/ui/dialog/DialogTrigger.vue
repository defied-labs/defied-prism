<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { Button } from "../button";
import { useDialog, type DialogButtonProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DialogButtonProps>(), {
  asChild: false,
  variant: "outline",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const dialog = useDialog("DialogTrigger");

function onClick(event: MouseEvent) {
  emit("click", event);
  if (event.defaultPrevented) return;
  if (!dialog.open.value) dialog.trigger.current = event.currentTarget as HTMLElement;
  dialog.open.value = !dialog.open.value;
}

// Read in the render, so state changes re-render the trigger
const triggerAttrs = () => ({
  ...attrs,
  "aria-haspopup": "dialog",
  "aria-expanded": dialog.open.value ? "true" : "false",
  "aria-controls": dialog.open.value ? dialog.contentId : undefined,
  "data-state": dialog.open.value ? "open" : "closed",
});
</script>

<template>
  <Slot v-if="props.asChild" v-bind="triggerAttrs()" @click="onClick"><slot /></Slot>
  <Button
    v-else
    data-slot="dialog-trigger"
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
