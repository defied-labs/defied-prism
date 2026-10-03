<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { useTable } from "./context";

export interface TableHeadProps {
  /** Defaults to "col"; use "row" for row headers in the body. */
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TableHeadProps>(), { scope: "col" });

const attrs = useAttrs();
const table = useTable();

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = table.variants();
  return {
    ...rest,
    scope: props.scope,
    "data-slot": "table-head",
    ...variantData(variants),
    class: slotClass(slots, "head", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <th v-bind="rootAttrs()"><slot /></th>
</template>
