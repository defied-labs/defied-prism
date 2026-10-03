<script setup lang="ts">
import { ref } from "vue";
import { Textarea } from "../../components/ui/textarea";

const message = ref("");
</script>

<template>
  <label style="display: grid; gap: 0.5rem">
    Message
    <Textarea
      v-model="message"
      :rows="1"
      resize="none"
      auto-resize
      full-width
      placeholder="Type a few lines..."
    />
    <span>{{ message.length }} characters</span>
  </label>
</template>
