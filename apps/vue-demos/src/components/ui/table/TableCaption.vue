<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { useTable } from "./context";

/** Names the table (and its scroll region). Render it first inside Table. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const table = useTable();
onMounted(() => table.setHasCaption(true));
onBeforeUnmount(() => table.setHasCaption(false));

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = table.variants();
  return {
    id: table.captionId,
    ...rest,
    "data-slot": "table-caption",
    ...variantData(variants),
    class: slotClass(slots, "caption", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <caption v-bind="rootAttrs()"><slot /></caption>
</template>
