<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../components/ui/button";

const saving = ref(false);
function save() {
  saving.value = true;
  setTimeout(() => (saving.value = false), 2000);
}
</script>

<template>
  <div style="display: flex; gap: 0.5rem">
    <Button :loading="saving" @click="save">{{ saving ? "Saving…" : "Save changes" }}</Button>
    <Button variant="outline" disabled>Archived</Button>
  </div>
</template>
