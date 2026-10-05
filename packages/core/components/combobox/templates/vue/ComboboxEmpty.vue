<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { useComboboxContext } from "./context";
import { slots } from "./styles";

/**
 * Announced when the list is open and nothing matches. Place it next to
 * `ComboboxContent`, not inside it (a listbox may only contain options).
 */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxEmpty");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    role: "status",
    "data-slot": "combobox-empty",
    ...variantData(variants),
    class: slotClass(slots, "empty", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="ctx.open.value && ctx.visible.value.length === 0" v-bind="rootAttrs()">
    <slot>No results</slot>
  </div>
</template>
