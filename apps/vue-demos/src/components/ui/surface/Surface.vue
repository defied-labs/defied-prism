<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import styles from "./Surface.module.css";

/** A themed panel: background, border, radius and elevation. */
export interface SurfaceProps {
  /** Element to render. */
  as?: "div" | "section" | "article" | "aside";
  variant?: "flat" | "raised" | "outlined" | "sunken";
  padding?: "none" | "sm" | "md" | "lg";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SurfaceProps>(), { as: "div", variant: "outlined", padding: "md" });
const attrs = useAttrs();
const variants = () => ({ variant: props.variant, padding: props.padding });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "surface",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
