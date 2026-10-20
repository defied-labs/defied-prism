<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import styles from "./Divider.module.css";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** Purely visual: hidden from assistive technology. */
  decorative?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

/**
 * Horizontal: an `<hr>` (implicit separator). Vertical: a `div` with
 * role="separator" and aria-orientation="vertical". Decorative dividers
 * carry no semantics.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DividerProps>(), {
  orientation: "horizontal",
  decorative: false,
});

const attrs = useAttrs();
const variants = () => ({ orientation: props.orientation });

// Read in the render, so attribute changes re-render the divider
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const semantics: Record<string, string> = props.decorative
    ? { role: "none", "aria-hidden": "true" }
    : props.orientation === "vertical"
      ? { role: "separator", "aria-orientation": "vertical" }
      : {};
  return {
    ...rest,
    ...semantics,
    "data-slot": "divider",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <div v-if="props.orientation === 'vertical'" v-bind="rootAttrs()" />
  <hr v-else v-bind="rootAttrs()" />
</template>
