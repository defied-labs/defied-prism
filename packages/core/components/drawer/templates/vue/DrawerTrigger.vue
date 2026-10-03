<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { Button } from "../button";
import { useDrawer, type DrawerButtonProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerButtonProps>(), {
  asChild: false,
  variant: "outline",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const drawer = useDrawer("DrawerTrigger");

function onClick(event: MouseEvent) {
  emit("click", event);
  if (!event.defaultPrevented) drawer.open.value = !drawer.open.value;
}

// Read in the render, so state changes re-render the trigger
const triggerAttrs = () => ({
  ...attrs,
  "aria-haspopup": "dialog",
  "aria-expanded": drawer.open.value ? "true" : "false",
  "aria-controls": drawer.open.value ? drawer.contentId : undefined,
  "data-state": drawer.open.value ? "open" : "closed",
});
</script>

<template>
  <Slot v-if="props.asChild" v-bind="triggerAttrs()" @click="onClick"><slot /></Slot>
  <Button
    v-else
    data-slot="drawer-trigger"
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
