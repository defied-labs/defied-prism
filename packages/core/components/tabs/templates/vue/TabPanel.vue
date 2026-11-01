<script setup lang="ts">
import { normalizeClass, normalizeStyle, useAttrs } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
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
  const { class: className, style, ...rest } = attrs;
  const selected = ctx.value.value === props.value;
  const variants = ctx.variants.value;
  // -1 waits before the selected panel, 1 after it
  const values = ctx.tabs.items.value.map((tab) => tab.value);
  const self = values.indexOf(props.value);
  const active = ctx.value.value == null ? -1 : values.indexOf(ctx.value.value);
  const offset = selected ? 0 : self !== -1 && active !== -1 && self < active ? -1 : 1;
  return {
    ...rest,
    // Inactive panels stay in layout (all panels share one grid cell, so the
    // region keeps the size of the largest) but are invisible and inert
    style: [
      normalizeStyle(style),
      { "--prism-tabs-offset": offset, ...(selected ? null : { visibility: "hidden" }) },
    ],
    role: "tabpanel",
    id: idFor(ctx.baseId, "panel", props.value),
    "aria-labelledby": idFor(ctx.baseId, "tab", props.value),
    tabindex: 0,
    "aria-hidden": selected ? undefined : true,
    inert: selected ? undefined : true,
    "data-state": selected ? "active" : "inactive",
    "data-direction": ctx.direction.value,
    "data-slot": "tabs-panel",
    ...variantData(variants),
    class: slotClass(slots, "panel", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
