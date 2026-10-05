<script setup lang="ts">
import { provide, ref, useId } from "vue";
import { useControllableState } from "@defied-labs/prism-vue";
import { DialogKey } from "./context";

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), { open: undefined, defaultOpen: false });
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const open = useControllableState({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => {
    emit("update:open", next);
    emit("openChange", next);
  },
});
const id = useId();

provide(DialogKey, {
  open,
  trigger: { current: null },
  contentId: `${id}-content`,
  titleId: `${id}-title`,
  descriptionId: `${id}-description`,
  hasTitle: ref(false),
  hasDescription: ref(false),
});
</script>

<template>
  <slot />
</template>
