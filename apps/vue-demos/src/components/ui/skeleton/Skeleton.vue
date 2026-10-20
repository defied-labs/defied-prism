<script setup lang="ts">
import { inject, normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";
import { SkeletonKey, type SkeletonVariant } from "./context";

export interface SkeletonProps {
  /** Shape; defaults to the group's variant, else "text". */
  variant?: SkeletonVariant;
}

/** A decorative placeholder shape (aria-hidden). Size it with class/style. */
defineOptions({ inheritAttrs: false });

const props = defineProps<SkeletonProps>();

const attrs = useAttrs();
const inherited = inject(SkeletonKey, null);
const variants = () => ({ variant: props.variant ?? inherited?.() ?? "text" });

// Read in the render, so attribute changes re-render the shape
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "aria-hidden": "true" as const,
    "data-slot": "skeleton-shape",
    ...variantData(variants()),
    class: slotClass(slots, "shape", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <span v-bind="rootAttrs()" />
</template>
