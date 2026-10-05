<script setup lang="ts">
import { normalizeClass, ref, useAttrs } from "vue";
import { useField, usePresence } from "@defied-labs/prism-vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { useComboboxContext } from "./context";
import { slots } from "./styles";

/**
 * The listbox. Always mounted (hidden while closed or empty) so items can
 * register; stays visible with data-state="closed" while it rolls up.
 */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxContent");
const field = useField();
const el = ref<HTMLElement | null>(null);
const { present, state } = usePresence(() => ctx.showList.value, el);

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
    hidden: !present.value,
    "data-state": state.value,
    "data-slot": "combobox-listbox",
    ...variantData(variants),
    class: slotClass(slots, "listbox", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div ref="el" v-bind="rootAttrs()"><slot /></div>
</template>
