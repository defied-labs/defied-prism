<script setup lang="ts">
import { Button } from "../components/ui/button";

defineProps<{
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <Button :variant="variant" :size="size" :loading="loading" :disabled="disabled">Ship it</Button>
</template>
