<script setup lang="ts">
import { Calendar } from "../../components/ui/calendar";

const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00`).getDay());
</script>

<template>
  <Calendar
    default-month="2026-11-01"
    min="2026-11-02"
    max="2026-11-27"
    :is-date-disabled="isWeekend"
    :week-starts-on="1"
    aria-label="Delivery date"
  />
</template>
