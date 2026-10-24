<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { Slot } from "@defied/prism-vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";

export interface HeaderBrandProps {
  /** Render your own link (e.g. a router link) instead of an <a>. */
  asChild?: boolean;
}

/** The logo or product name, linking home. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderBrandProps>(), { asChild: false });
const attrs = useAttrs();

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return { ...rest, "data-slot": "header-brand", class: slotClass(slots, "brand", {}, normalizeClass(className)) };
};
</script>

<template>
  <Slot v-if="props.asChild" v-bind="rootAttrs()"><slot /></Slot>
  <a v-else v-bind="rootAttrs()"><slot /></a>
</template>
