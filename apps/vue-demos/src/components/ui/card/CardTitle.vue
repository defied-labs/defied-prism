<script setup lang="ts">
import { useAttrs } from "vue";
import { partAttrs, useCardVariants } from "./context";

export interface CardTitleProps {
  /** Heading level in the document outline: renders h1-h6. Default 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CardTitleProps>(), { level: 3 });
const attrs = useAttrs();
const variants = useCardVariants();
</script>

<template>
  <component :is="`h${props.level}`" v-bind="partAttrs(attrs, 'title', variants())"><slot /></component>
</template>
