<script setup lang="ts">
import { inject, normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
import { GroupContext, useComboboxContext } from "./context";
import { slots } from "./styles";

/** A group's heading; names the surrounding `ComboboxGroup`. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxLabel");
const group = inject(GroupContext, null);
onMounted(() => group?.setHasLabel(true));
onBeforeUnmount(() => group?.setHasLabel(false));

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    id: group?.labelId,
    ...rest,
    role: "presentation",
    "data-slot": "combobox-label",
    ...variantData(variants),
    class: slotClass(slots, "label", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
