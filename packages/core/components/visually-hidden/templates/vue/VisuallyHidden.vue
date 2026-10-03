<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

/** Content for screen readers only. */
export interface VisuallyHiddenProps {
  /**
   * Reveal while focused. Combine with `asChild` so the focusable element
   * itself is hidden: `<VisuallyHidden focusable as-child><a href="#main">Skip to content</a></VisuallyHidden>`.
   */
  focusable?: boolean;
  /** Merge onto the single child element instead of rendering a span. */
  asChild?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<VisuallyHiddenProps>(), { focusable: false, asChild: false });
const attrs = useAttrs();
const variants = () => ({ focusable: props.focusable });

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "visually-hidden",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <Slot v-if="props.asChild" v-bind="rootAttrs()"><slot /></Slot>
  <span v-else v-bind="rootAttrs()"><slot /></span>
</template>
