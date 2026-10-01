<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass } from "@defied-prism/core";
import { slots } from "./styles";
import { useDialog } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const dialog = useDialog("DialogDescription");
onMounted(() => {
  dialog.hasDescription.value = true;
});
onBeforeUnmount(() => {
  dialog.hasDescription.value = false;
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: dialog.descriptionId,
    "data-slot": "dialog-description",
    class: slotClass(slots, "description", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <p v-bind="rootAttrs()"><slot /></p>
</template>
