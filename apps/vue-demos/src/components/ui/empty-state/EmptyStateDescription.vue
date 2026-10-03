<script setup lang="ts">
import { usePartAttrs } from "./context";

defineOptions({ inheritAttrs: false });

const { partAttrs } = usePartAttrs("description");
</script>

<template>
  <p v-bind="partAttrs()"><slot /></p>
</template>
