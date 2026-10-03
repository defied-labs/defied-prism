<script setup lang="ts">
/** Decorative illustration or icon (aria-hidden). */
import { usePartAttrs } from "./context";

defineOptions({ inheritAttrs: false });

const { partAttrs } = usePartAttrs("icon");
</script>

<template>
  <div aria-hidden="true" v-bind="partAttrs()"><slot /></div>
</template>
