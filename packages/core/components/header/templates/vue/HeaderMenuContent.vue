<script setup lang="ts">
import { normalizeClass, normalizeStyle, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useHeader, useMenu } from "./context";

export interface HeaderMenuContentProps {
  /** Columns of links (e.g. 2 for product cards); collapsed, always 1. */
  columns?: number;
}

/** The menu's links, centered under its trigger. Rendered only while its menu is open. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderMenuContentProps>(), { columns: 1 });

const attrs = useAttrs();
const header = useHeader("HeaderMenuContent");
const menu = useMenu("HeaderMenuContent");

const panelClass = () => slotClass(slots, "panel", {});

const contentAttrs = () => {
  const { class: className, style, ...rest } = attrs;
  return {
    ...rest,
    id: menu.contentId,
    "data-slot": "header-content",
    "data-state": "open",
    "data-orientation": header.orientation.value,
    style: normalizeStyle([{ "--prism-header-columns": props.columns }, style]),
    class: slotClass(slots, "content", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="menu.open.value" v-bind="contentAttrs()">
    <div data-slot="header-panel" :data-orientation="header.orientation.value" :class="panelClass()"><slot /></div>
  </div>
</template>
