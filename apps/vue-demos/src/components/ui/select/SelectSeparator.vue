<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { useSelectContext } from "./context";
import { slots } from "./styles";

/** A visual divider between items (hidden from assistive technology). */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectSeparator");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    "aria-hidden": "true" as const,
    "data-slot": "select-separator",
    ...variantData(variants),
    class: slotClass(slots, "separator", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()" />
</template>
