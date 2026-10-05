<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { usePalette } from "./context";

/** Shown (as a live status) only when nothing matches. Place it next to `CommandList`, not inside. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = usePalette("CommandEmpty");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    role: "status",
    "data-slot": "command-palette-empty",
    ...variantData(variants),
    class: slotClass(slots, "empty", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="!ctx.hasResults.value" v-bind="rootAttrs()"><slot>No results</slot></div>
</template>
