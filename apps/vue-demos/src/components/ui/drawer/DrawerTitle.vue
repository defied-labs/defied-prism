<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useDrawer } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const drawer = useDrawer("DrawerTitle");
onMounted(() => {
  drawer.hasTitle.value = true;
});
onBeforeUnmount(() => {
  drawer.hasTitle.value = false;
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: drawer.titleId,
    "data-slot": "drawer-title",
    class: slotClass(slots, "title", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <h2 v-bind="rootAttrs()"><slot /></h2>
</template>
