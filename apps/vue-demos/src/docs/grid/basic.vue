<script setup lang="ts">
import { Grid } from "../../components/ui/grid";

const cell = { border: "1px dashed currentColor", borderRadius: "6px", padding: "12px", textAlign: "center" } as const;
</script>

<template>
  <Grid :columns="3" gap="sm">
    <div v-for="n in 6" :key="n" :style="cell">{{ n }}</div>
  </Grid>
</template>
