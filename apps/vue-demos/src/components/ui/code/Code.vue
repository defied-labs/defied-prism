<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, type StyleSlots } from "@defied/prism-core";
import styles from "./Code.module.css";

/** Inline code. */
export type CodeProps = Record<string, never>;

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = () => ({});

// Read in the render, so attribute changes re-render
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "code",
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <code v-bind="rootAttrs()"><slot /></code>
</template>
