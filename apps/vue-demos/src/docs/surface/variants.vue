<script setup lang="ts">
import { Surface } from "../../components/ui/surface";

const variants = ["flat", "raised", "outlined", "sunken"] as const;
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); gap: 1rem">
    <Surface v-for="variant in variants" :key="variant" :variant="variant" padding="md">
      {{ variant }}
    </Surface>
  </div>
</template>
