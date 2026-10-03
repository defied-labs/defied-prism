<script setup lang="ts">
/** The card's primary link; an `interactive` card forwards area clicks to it. */
import { useAttrs } from "vue";
import { partAttrs, useCardVariants } from "./context";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useCardVariants();
</script>

<template>
  <a v-bind="partAttrs(attrs, 'link', variants())"><slot /></a>
</template>
