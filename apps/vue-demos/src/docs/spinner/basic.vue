<script setup lang="ts">
import { Spinner } from "../../components/ui/spinner";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 1rem">
    <Spinner size="xs" />
    <Spinner size="sm" />
    <Spinner size="md" label="Loading invoices" />
    <Spinner size="lg" style="color: #2563eb" />
  </div>
</template>
