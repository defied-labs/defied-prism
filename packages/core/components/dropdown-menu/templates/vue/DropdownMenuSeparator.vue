<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass } from "@defied-prism/core";
import { slots } from "./styles";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    role: "separator",
    "data-slot": "dropdown-menu-separator",
    class: slotClass(slots, "separator", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()" />
</template>
