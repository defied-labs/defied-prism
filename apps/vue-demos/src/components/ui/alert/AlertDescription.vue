<script setup lang="ts">
import { useAttrs } from "vue";
import { partAttrs, useAlertVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useAlertVariants();
</script>

<template>
  <div v-bind="partAttrs(attrs, 'description', variants())"><slot /></div>
</template>
