<script setup lang="ts">
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "../../components/ui/empty-state";
import { Button } from "../../components/ui/button";
</script>

<template>
  <EmptyState>
    <EmptyStateIcon>📭</EmptyStateIcon>
    <EmptyStateTitle>No invoices yet</EmptyStateTitle>
    <EmptyStateDescription>Invoices you send will show up here.</EmptyStateDescription>
    <EmptyStateActions>
      <Button>Create invoice</Button>
      <Button variant="ghost">Import</Button>
    </EmptyStateActions>
  </EmptyState>
</template>
