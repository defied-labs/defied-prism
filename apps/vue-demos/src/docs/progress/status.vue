<script setup lang="ts">
import { Progress } from "../../components/ui/progress";
</script>

<template>
  <div style="display: grid; gap: 1rem; width: 100%; max-width: 24rem">
    <Progress aria-label="Disk A used" :value="45" status="success" size="sm" />
    <Progress aria-label="Disk B used" :value="80" status="warning" />
    <Progress aria-label="Disk C used" :value="97" status="danger" size="lg" />
  </div>
</template>
