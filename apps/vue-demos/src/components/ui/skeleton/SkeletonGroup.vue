<script setup lang="ts">
import { normalizeClass, provide, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { SkeletonKey, type SkeletonVariant } from "./context";

export interface SkeletonGroupProps {
  /** Default shape for the Skeletons inside. */
  variant?: SkeletonVariant;
  /** Announced (visually hidden) while loading. */
  label?: string;
}

/**
 * The loading region: `role="status"` + `aria-busy="true"` with a hidden
 * label, so assistive technology hears "Loading" once instead of a pile of
 * empty shapes. Render the real content in its place when loading finishes.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SkeletonGroupProps>(), { variant: "text", label: "Loading" });

const attrs = useAttrs();
provide(SkeletonKey, () => props.variant);
const variants = () => ({ variant: props.variant });

// Read in the render, so attribute changes re-render the group
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    role: "status",
    ...rest,
    "aria-busy": "true" as const,
    "data-slot": "skeleton",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
const labelAttrs = () => ({
  "data-slot": "skeleton-label",
  ...variantData(variants()),
  class: slotClass(slots, "label", variants()),
});
</script>

<template>
  <div v-bind="rootAttrs()">
    <span v-bind="labelAttrs()">{{ props.label }}</span>
    <slot />
  </div>
</template>
