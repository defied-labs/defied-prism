<script setup lang="ts">
import { useAttrs } from "vue";
import { partAttrs, useCardVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useCardVariants();
</script>

<template>
  <p v-bind="partAttrs(attrs, 'description', variants())"><slot /></p>
</template>
