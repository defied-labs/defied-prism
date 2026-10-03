<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "../../components/ui/switch";

const checked = ref(false);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 1rem">
    <Switch v-model="checked">Email notifications</Switch>
    <span>{{ checked ? "On" : "Off" }}</span>
  </div>
</template>
