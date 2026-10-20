<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useDrawer } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const drawer = useDrawer("DrawerDescription");
onMounted(() => {
  drawer.hasDescription.value = true;
});
onBeforeUnmount(() => {
  drawer.hasDescription.value = false;
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: drawer.descriptionId,
    "data-slot": "drawer-description",
    class: slotClass(slots, "description", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <p v-bind="rootAttrs()"><slot /></p>
</template>
