<script setup lang="ts">
import { useAttrs } from "vue";
import { partAttrs, useCardVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useCardVariants();
</script>

<template>
  <div v-bind="partAttrs(attrs, 'header', variants())"><slot /></div>
</template>
