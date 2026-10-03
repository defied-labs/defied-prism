<script setup lang="ts">
import { ref } from "vue";
import { IconButton } from "../../components/ui/icon-button";

const saving = ref(false);
function save() {
  saving.value = true;
  setTimeout(() => (saving.value = false), 1500);
}
</script>

<template>
  <IconButton
    aria-label="Save"
    variant="primary"
    :loading="saving"
    @click="save"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </IconButton>
</template>
