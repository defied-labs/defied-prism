<script setup lang="ts">
import { Textarea } from "../../components/ui/textarea";
</script>

<template>
  <label style="display: grid; gap: 0.5rem">
    Feedback
    <Textarea name="feedback" :rows="3" placeholder="What could we do better?" full-width />
  </label>
</template>
