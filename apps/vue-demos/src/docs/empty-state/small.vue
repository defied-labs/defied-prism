<script setup lang="ts">
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "../../components/ui/empty-state";
</script>

<template>
  <EmptyState size="sm" :heading-level="4">
    <EmptyStateTitle>No results for “invoce”</EmptyStateTitle>
    <EmptyStateDescription>Check the spelling or try a broader search.</EmptyStateDescription>
  </EmptyState>
</template>
