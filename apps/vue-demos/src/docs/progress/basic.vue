<script setup lang="ts">
import { Progress } from "../../components/ui/progress";
</script>

<template>
  <div style="display: grid; gap: 1rem; width: 100%; max-width: 24rem">
    <Progress aria-label="Uploading files" :value="3" :max="10" value-text="3 of 10 files" />
    <Progress aria-label="Preparing export" indeterminate />
  </div>
</template>
