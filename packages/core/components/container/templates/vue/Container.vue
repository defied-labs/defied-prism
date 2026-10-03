<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

/** Centered, max-width page column with inline padding. */
export interface ContainerProps {
  /** Element to render. */
  as?: "div" | "section" | "main" | "header" | "footer";
  /** Max width: sm 40rem, md 48rem, lg 64rem, xl 80rem, full none. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ContainerProps>(), { as: "div", size: "lg" });
const attrs = useAttrs();
const variants = () => ({ size: props.size });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "container",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
