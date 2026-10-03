<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { Button } from "../button";
import { useDrawer, type DrawerButtonProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerButtonProps>(), {
  asChild: false,
  variant: "secondary",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const drawer = useDrawer("DrawerClose");

function onClick(event: MouseEvent) {
  emit("click", event);
  if (!event.defaultPrevented) drawer.open.value = false;
}
</script>

<template>
  <Slot v-if="props.asChild" v-bind="attrs" @click="onClick"><slot /></Slot>
  <Button
    v-else
    data-slot="drawer-close"
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
