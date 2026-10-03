<script setup lang="ts">
import { Label } from "../../components/ui/label";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <input id="newsletter" type="checkbox" />
    <Label for="newsletter">Send me the monthly newsletter</Label>
  </div>
</template>
