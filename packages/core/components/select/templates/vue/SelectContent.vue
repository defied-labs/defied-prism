<script setup lang="ts">
import { normalizeClass, ref, useAttrs } from "vue";
import { useField, usePresence } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { useSelectContext } from "./context";
import { slots } from "./styles";

/** The listbox. Always mounted (hidden while closed) so items can register. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectContent");
const field = useField();
const listboxRef = ref<HTMLDivElement | null>(null);
// Stays visible with data-state="closed" while the exit animation plays
const { present, state } = usePresence(() => ctx.open.value, listboxRef);

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const { label, labelledBy: own } = ctx.labelling.value;
  const labelledBy = own ?? (field && !label ? field.labelId : undefined);
  const variants = ctx.variants.value;
  return {
    "aria-labelledby": labelledBy,
    "aria-label": labelledBy ? undefined : label,
    ...rest,
    id: ctx.listboxId,
    role: "listbox",
    tabindex: -1,
    hidden: !present.value,
    "data-state": state.value,
    "data-slot": "select-listbox",
    ...variantData(variants),
    class: slotClass(slots, "listbox", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div ref="listboxRef" v-bind="rootAttrs()"><slot /></div>
</template>
