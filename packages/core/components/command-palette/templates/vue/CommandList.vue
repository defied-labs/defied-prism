<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { usePalette } from "./context";

/** The listbox. Stays mounted when nothing matches so `aria-controls` stays valid. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = usePalette("CommandList");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    "aria-label": attrs["aria-labelledby"] ? undefined : ctx.label.value,
    ...rest,
    id: ctx.listboxId,
    role: "listbox",
    "data-slot": "command-palette-listbox",
    ...variantData(variants),
    class: slotClass(slots, "listbox", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
