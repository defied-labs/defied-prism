<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useDialog } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const dialog = useDialog("DialogTitle");
onMounted(() => {
  dialog.hasTitle.value = true;
});
onBeforeUnmount(() => {
  dialog.hasTitle.value = false;
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: dialog.titleId,
    "data-slot": "dialog-title",
    class: slotClass(slots, "title", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <h2 v-bind="rootAttrs()"><slot /></h2>
</template>
