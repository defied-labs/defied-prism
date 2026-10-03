<script setup lang="ts">
import { computed, ref } from "vue";
import { Pagination } from "../../components/ui/pagination";

const results = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India"];
const perPage = 3;

const page = ref(1);
const shown = computed(() => results.slice((page.value - 1) * perPage, page.value * perPage));
</script>

<template>
  <div>
    <p>Results: {{ shown.join(", ") }}</p>
    <Pagination v-model:page="page" :count="Math.ceil(results.length / perPage)" aria-label="Results pages">
      <template #previous>Previous</template>
      <template #next>Next</template>
    </Pagination>
  </div>
</template>
