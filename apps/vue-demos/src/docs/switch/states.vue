<script setup lang="ts">
import { Switch } from "../../components/ui/switch";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start">
    <Switch size="sm" default-checked>Compact mode</Switch>
    <Switch disabled>Beta features (unavailable)</Switch>
    <Switch disabled default-checked>Two-factor authentication (required)</Switch>
  </div>
</template>
