<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

/** Generic layout box. */
export type BoxElement =
  | "div"
  | "span"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav";

export interface BoxProps {
  /** Element to render. */
  as?: BoxElement;
  padding?: "none" | "sm" | "md" | "lg";
  background?: "none" | "subtle" | "muted";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BoxProps>(), { as: "div", padding: "none", background: "none" });
const attrs = useAttrs();
const variants = () => ({ padding: props.padding, background: props.background });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "box",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
