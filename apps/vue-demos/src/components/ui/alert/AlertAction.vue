<script setup lang="ts">
/** Container for action buttons, placed after the content. */
import { useAttrs } from "vue";
import { partAttrs, useAlertVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useAlertVariants();
</script>

<template>
  <div v-bind="partAttrs(attrs, 'action', variants())"><slot /></div>
</template>
