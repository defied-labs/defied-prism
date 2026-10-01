<script setup lang="ts">
import { ref } from "vue";
import { Calendar } from "../components/ui/calendar";

const date = ref<string | null>(null);
</script>

<template>
  <Calendar v-model="date" aria-label="Release date" />
</template>
