<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import styles from "./Inline.module.css";

/** Horizontal flex layout that wraps. */
export type InlineElement = "div" | "span" | "section" | "header" | "footer" | "nav" | "ul" | "ol";

export interface InlineProps {
  /** Element to render. */
  as?: InlineElement;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  /** Wrap items onto new lines (default) or keep them on one line. */
  wrap?: "wrap" | "nowrap";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InlineProps>(), { as: "div", gap: "sm", align: "center", justify: "start", wrap: "wrap" });
const attrs = useAttrs();
const variants = () => ({ gap: props.gap, align: props.align, justify: props.justify, wrap: props.wrap });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "inline",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
