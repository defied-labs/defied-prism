<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { idFor, useTabs } from "./context";
import { slots } from "./styles";

export interface TabPanelProps {
  value: string;
}

defineOptions({ inheritAttrs: false });
const props = defineProps<TabPanelProps>();

const attrs = useAttrs();
const ctx = useTabs("TabPanel");

// Read in the render, so attribute changes re-render the panel
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const selected = ctx.value.value === props.value;
  const variants = ctx.variants.value;
  return {
    ...rest,
    role: "tabpanel",
    id: idFor(ctx.baseId, "panel", props.value),
    "aria-labelledby": idFor(ctx.baseId, "tab", props.value),
    tabindex: 0,
    hidden: !selected,
    "data-state": selected ? "active" : "inactive",
    "data-slot": "tabs-panel",
    ...variantData(variants),
    class: slotClass(slots, "panel", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
