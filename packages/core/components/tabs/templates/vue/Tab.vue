<script setup lang="ts">
import { normalizeClass, ref, useAttrs } from "vue";
import { useCollectionItem } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { idFor, useTabs } from "./context";
import { slots } from "./styles";

export interface TabProps {
  value: string;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TabProps>(), { disabled: false });

const attrs = useAttrs();
const ctx = useTabs("Tab");
const nodeRef = ref<HTMLElement | null>(null);
const id = () => idFor(ctx.baseId, "tab", props.value);
useCollectionItem(
  ctx.tabs,
  () => ({ id: id(), value: props.value, disabled: props.disabled }),
  nodeRef,
);

const isSelected = () => ctx.value.value === props.value;

// Roving tabindex: only the selected tab is in the tab order; with no
// selected tab, the first enabled one stays reachable by keyboard
const tabIndex = () => {
  if (isSelected()) return 0;
  const tabs = ctx.tabs.items.value;
  if (tabs.some((tab) => tab.value === ctx.value.value)) return -1;
  return tabs.find((tab) => !tab.disabled)?.value === props.value ? 0 : -1;
};

function onClick(event: MouseEvent) {
  if (!event.defaultPrevented && !props.disabled) ctx.select(props.value);
}

// Read in the render, so attribute changes re-render the tab
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const selected = isSelected();
  const variants = ctx.variants.value;
  return {
    ...rest,
    type: "button" as const,
    role: "tab",
    id: id(),
    "aria-selected": selected,
    "aria-controls": idFor(ctx.baseId, "panel", props.value),
    tabindex: tabIndex(),
    disabled: props.disabled,
    "data-value": props.value,
    "data-state": selected ? "active" : "inactive",
    "data-slot": "tabs-trigger",
    ...variantData(variants),
    class: slotClass(slots, "trigger", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <button ref="nodeRef" v-bind="rootAttrs()" @click="onClick"><slot /></button>
</template>
