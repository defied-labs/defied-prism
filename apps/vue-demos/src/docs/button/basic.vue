<script setup lang="ts">
import { Button } from "../../components/ui/button";
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
    <Button>Save</Button>
    <Button variant="secondary">Duplicate</Button>
    <Button variant="outline">Export</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="destructive">Delete</Button>
    <Button variant="link">Learn more</Button>
  </div>
</template>
