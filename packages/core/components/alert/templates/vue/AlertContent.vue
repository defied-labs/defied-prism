<script setup lang="ts">
/** Wraps title and description so they stack next to the icon. */
import { useAttrs } from "vue";
import { partAttrs, useAlertVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useAlertVariants();
</script>

<template>
  <div v-bind="partAttrs(attrs, 'content', variants())"><slot /></div>
</template>
