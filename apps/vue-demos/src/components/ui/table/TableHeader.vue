<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { useTable } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const table = useTable();

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = table.variants();
  return {
    ...rest,
    "data-slot": "table-header",
    ...variantData(variants),
    class: slotClass(slots, "header", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <thead v-bind="rootAttrs()"><slot /></thead>
</template>
