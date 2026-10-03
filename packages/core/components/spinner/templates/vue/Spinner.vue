<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  /** Announced text (visually hidden). */
  label?: string;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

/**
 * A polite status region: the visually hidden label is announced when the
 * spinner appears. Its color follows `currentColor`.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SpinnerProps>(), { size: "md", label: "Loading" });

const attrs = useAttrs();
const variants = () => ({ size: props.size });

// Read in the render, so attribute changes re-render the spinner
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    role: "status",
    ...rest,
    "data-slot": "spinner",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
const partAttrs = (slot: "indicator" | "label") => ({
  "data-slot": `spinner-${slot}`,
  ...variantData(variants()),
  class: slotClass(slots, slot, variants()),
});
</script>

<template>
  <span v-bind="rootAttrs()">
    <span aria-hidden="true" v-bind="partAttrs('indicator')" />
    <span v-bind="partAttrs('label')">{{ props.label }}</span>
  </span>
</template>
