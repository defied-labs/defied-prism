<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { useField } from "@defied-prism/vue";
import { slotClass, variantData } from "@defied-prism/core";
import { useSelectContext } from "./context";
import { slots } from "./styles";

/** The listbox. Always mounted (hidden while closed) so items can register. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectContent");
const field = useField();

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const { label, labelledBy: own } = ctx.labelling.value;
  const labelledBy = own ?? (field && !label ? field.labelId : undefined);
  const open = ctx.open.value;
  const variants = ctx.variants.value;
  return {
    "aria-labelledby": labelledBy,
    "aria-label": labelledBy ? undefined : label,
    ...rest,
    id: ctx.listboxId,
    role: "listbox",
    tabindex: -1,
    hidden: !open,
    "data-state": open ? "open" : "closed",
    "data-slot": "select-listbox",
    ...variantData(variants),
    class: slotClass(slots, "listbox", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
