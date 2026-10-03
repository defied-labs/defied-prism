<script setup lang="ts">
import { VisuallyHidden } from "../../components/ui/visually-hidden";
</script>

<template>
  <div>
    <VisuallyHidden focusable as-child>
      <a href="#main-content">Skip to content</a>
    </VisuallyHidden>
    <p>Click here, then press Tab: the link appears while it has focus.</p>
  </div>
</template>
