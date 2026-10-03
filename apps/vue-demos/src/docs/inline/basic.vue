<script setup lang="ts">
import { Inline } from "../../components/ui/inline";

const tags = ["design", "react", "vue", "accessibility", "tokens"];
</script>

<template>
  <Inline as="ul" gap="xs" aria-label="Tags" style="list-style: none; padding: 0; margin: 0">
    <li
      v-for="tag in tags"
      :key="tag"
      style="padding: 2px 8px; border: 1px solid currentColor; border-radius: 999px"
    >
      {{ tag }}
    </li>
  </Inline>
</template>
