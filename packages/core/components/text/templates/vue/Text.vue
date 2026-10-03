<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

/** Body text. */
export interface TextProps {
  /** Element to render. */
  as?: "p" | "span" | "div";
  size?: "lg" | "md" | "sm" | "xs";
  tone?: "body" | "lead" | "muted" | "success" | "warning" | "danger";
  weight?: "regular" | "medium" | "semibold" | "bold";
  /** Single line, cut off with an ellipsis. */
  truncate?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TextProps>(), { as: "p", size: "md", tone: "body", weight: "regular", truncate: false });
const attrs = useAttrs();
const variants = () => ({ size: props.size, tone: props.tone, weight: props.weight, truncate: props.truncate });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "text",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
