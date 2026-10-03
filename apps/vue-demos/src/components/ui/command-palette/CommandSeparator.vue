<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { usePalette } from "./context";

/** Decorative divider; hidden while searching. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = usePalette("CommandSeparator");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    "aria-hidden": "true" as const,
    "data-slot": "command-palette-separator",
    ...variantData(variants),
    class: slotClass(slots, "separator", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="!ctx.query.value.trim()" v-bind="rootAttrs()" />
</template>
