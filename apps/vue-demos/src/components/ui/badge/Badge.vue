<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import styles from "./Badge.module.css";

/**
 * A small, non-interactive label. Color alone doesn't carry meaning: make
 * the text say the status ("Failed", not just a red dot).
 */
export interface BadgeProps {
  status?: "neutral" | "info" | "success" | "warning" | "danger";
  variant?: "subtle" | "solid" | "outline";
  size?: "sm" | "md";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BadgeProps>(), {
  status: "neutral",
  variant: "subtle",
  size: "md",
});

const attrs = useAttrs();
const variants = () => ({ status: props.status, variant: props.variant, size: props.size });

// Read in the render, so attribute changes re-render the badge
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "badge",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <span v-bind="rootAttrs()"><slot /></span>
</template>
