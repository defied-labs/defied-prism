<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { GroupContext, useComboboxContext } from "./context";
import { slots } from "./styles";

/** A labelled group of items, hidden when none of them match. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxGroup");
const id = useId();
const labelId = `${id}-label`;
const hasLabel = ref(false);
provide(GroupContext, {
  id,
  labelId,
  setHasLabel: (has) => {
    hasLabel.value = has;
  },
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    "aria-labelledby": hasLabel.value ? labelId : undefined,
    ...rest,
    role: "group",
    hidden: !ctx.visibleGroups.value.has(id),
    "data-slot": "combobox-group",
    ...variantData(variants),
    class: slotClass(slots, "group", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
