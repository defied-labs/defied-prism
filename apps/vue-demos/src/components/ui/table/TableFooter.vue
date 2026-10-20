<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
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
    "data-slot": "table-footer",
    ...variantData(variants),
    class: slotClass(slots, "footer", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <tfoot v-bind="rootAttrs()"><slot /></tfoot>
</template>
