<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied-labs/prism-vue";
import { Button } from "../button";
import { useDialog, type DialogButtonProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DialogButtonProps>(), {
  asChild: false,
  variant: "secondary",
  size: "md",
  type: "button",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const dialog = useDialog("DialogClose");

function onClick(event: MouseEvent) {
  emit("click", event);
  if (!event.defaultPrevented) dialog.open.value = false;
}
</script>

<template>
  <Slot v-if="props.asChild" v-bind="attrs" @click="onClick"><slot /></Slot>
  <Button
    v-else
    data-slot="dialog-close"
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
