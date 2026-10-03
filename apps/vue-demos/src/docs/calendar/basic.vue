<script setup lang="ts">
import { ref } from "vue";
import { Calendar } from "../../components/ui/calendar";

const date = ref<string | null>(null);
</script>

<template>
  <div>
    <Calendar v-model="date" aria-label="Appointment date" />
    <p>Selected: {{ date ?? "none" }}</p>
  </div>
</template>
