<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";

/** Buttons at the end of the header (sign in, theme toggle). Not collapsed. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return { ...rest, "data-slot": "header-actions", class: slotClass(slots, "actions", {}, normalizeClass(className)) };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
