<script setup lang="ts">
import { Grid } from "../../components/ui/grid";

const cell = { border: "1px dashed currentColor", borderRadius: "6px", padding: "12px" } as const;
const plans = ["Hobby", "Team", "Business", "Enterprise"];
</script>

<template>
  <Grid as="ul" columns="auto" :style="{ listStyle: 'none', padding: 0, margin: 0 }">
    <li v-for="plan in plans" :key="plan" :style="cell">{{ plan }}</li>
  </Grid>
</template>
