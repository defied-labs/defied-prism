<script setup lang="ts">
import { Stack } from "../../components/ui/stack";
</script>

<template>
  <Stack as="ul" gap="xs" align="center" style="list-style: none; margin: 0; padding: 0">
    <li style="border: 1px dashed currentColor; padding: 0.5rem 0.75rem; border-radius: 6px">Short</li>
    <li style="border: 1px dashed currentColor; padding: 0.5rem 0.75rem; border-radius: 6px">A much longer item</li>
    <li style="border: 1px dashed currentColor; padding: 0.5rem 0.75rem; border-radius: 6px">Medium item</li>
  </Stack>
</template>
