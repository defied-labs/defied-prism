<script setup lang="ts">
import { usePartAttrs } from "./context";

defineOptions({ inheritAttrs: false });

const { context, partAttrs } = usePartAttrs("title");
</script>

<template>
  <component :is="`h${context.headingLevel()}`" v-bind="partAttrs()"><slot /></component>
</template>
