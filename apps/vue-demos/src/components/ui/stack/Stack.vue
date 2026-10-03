<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import styles from "./Stack.module.css";

/** Vertical flex layout. */
export type StackElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "nav" | "ul" | "ol";

export interface StackProps {
  /** Element to render. */
  as?: StackElement;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<StackProps>(), { as: "div", gap: "md", align: "stretch", justify: "start" });
const attrs = useAttrs();
const variants = () => ({ gap: props.gap, align: props.align, justify: props.justify });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "stack",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
