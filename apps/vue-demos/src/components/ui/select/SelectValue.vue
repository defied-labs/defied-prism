<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { useSelectContext } from "./context";
import { slots } from "./styles";

export interface SelectValueProps {
  /** Overrides the Select's placeholder (or use the `placeholder` slot). */
  placeholder?: string;
}

/** The selected item's text, or the placeholder. */
defineOptions({ inheritAttrs: false });
defineProps<SelectValueProps>();

const attrs = useAttrs();
const ctx = useSelectContext("SelectValue");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    "data-slot": "select-value",
    ...variantData(variants),
    class: slotClass(slots, "value", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <span v-bind="rootAttrs()"
    ><template v-if="ctx.selected.value">{{ ctx.selected.value.textValue }}</template
    ><span v-else data-part="placeholder"
      ><slot name="placeholder">{{ placeholder ?? ctx.placeholder.value }}</slot></span
    ></span
  >
</template>
