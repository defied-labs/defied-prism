<script setup lang="ts">
import { Button, ButtonIcon } from "../../components/ui/button";
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
    <Button size="xs">Extra small</Button>
    <Button size="sm">Small</Button>
    <Button size="md">
      <ButtonIcon>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </ButtonIcon>
      New project
    </Button>
    <Button size="lg">Large</Button>
    <Button size="xl">Extra large</Button>
  </div>
</template>
