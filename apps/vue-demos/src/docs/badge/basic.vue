<script setup lang="ts">
import { Badge } from "../../components/ui/badge";
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
    <Badge>Draft</Badge>
    <Badge status="info">In review</Badge>
    <Badge status="success">Paid</Badge>
    <Badge status="warning">Expiring</Badge>
    <Badge status="danger">Failed</Badge>
  </div>
</template>
