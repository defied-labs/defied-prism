<script setup lang="ts">
import { usePartAttrs } from "./context";

defineOptions({ inheritAttrs: false });

const { partAttrs } = usePartAttrs("actions");
</script>

<template>
  <div v-bind="partAttrs()"><slot /></div>
</template>
