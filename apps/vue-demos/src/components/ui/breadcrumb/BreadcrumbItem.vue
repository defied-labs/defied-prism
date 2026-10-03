<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { useBreadcrumb } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useBreadcrumb("BreadcrumbItem");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "breadcrumb-item",
    ...variantData(variants()),
    class: slotClass(slots, "item", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <li v-bind="rootAttrs()"><slot /></li>
</template>
