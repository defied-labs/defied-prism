<script setup lang="ts">
import { normalizeClass, provide, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { EmptyStateKey, type HeadingLevel } from "./context";

export interface EmptyStateProps {
  size?: "sm" | "md";
  /** Level of the EmptyStateTitle heading; match your page outline. */
  headingLevel?: HeadingLevel;
}

/**
 * `<EmptyState><EmptyStateIcon/><EmptyStateTitle/><EmptyStateDescription/>
 * <EmptyStateActions/></EmptyState>` — for empty lists and searches.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<EmptyStateProps>(), { size: "md", headingLevel: 3 });

const attrs = useAttrs();
const variants = () => ({ size: props.size });

provide(EmptyStateKey, { variants, headingLevel: () => props.headingLevel });

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "empty-state",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
