<script lang="ts">
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "xl" | "lg" | "md" | "sm" | "xs";

/** Size used when `size` is omitted. */
export const DEFAULT_HEADING_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "xl",
  2: "lg",
  3: "md",
  4: "sm",
  5: "xs",
  6: "xs",
};

export interface HeadingProps {
  /** Document outline level: renders h1-h6. */
  level?: HeadingLevel;
  /** Visual size, independent of level. Defaults from the level. */
  size?: HeadingSize;
}
</script>

<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeadingProps>(), { level: 2, size: undefined });
const attrs = useAttrs();
const variants = () => ({ size: props.size ?? DEFAULT_HEADING_SIZE[props.level] });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "heading",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="`h${props.level}`" v-bind="rootAttrs()"><slot /></component>
</template>
