<script setup lang="ts">
/** Decorative icon, hidden from assistive technology. */
import { useAttrs } from "vue";
import { partAttrs, useAlertVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useAlertVariants();
</script>

<template>
  <span v-bind="partAttrs(attrs, 'icon', variants(), { 'aria-hidden': 'true' })"><slot /></span>
</template>
