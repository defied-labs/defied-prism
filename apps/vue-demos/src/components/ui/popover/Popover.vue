<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { useControllableState } from "@defied-labs/prism-vue";
import { slotClass } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { PopoverKey } from "./context";

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
}

/** Positioning root: the content is placed relative to it. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverProps>(), { open: undefined, defaultOpen: false });
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const attrs = useAttrs();
const open = useControllableState({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => {
    emit("update:open", next);
    emit("openChange", next);
  },
});

provide(PopoverKey, { open, contentId: `${useId()}-popover`, triggerEl: ref(null) });

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "popover",
    "data-state": open.value ? "open" : "closed",
    class: slotClass(slots, "root", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
