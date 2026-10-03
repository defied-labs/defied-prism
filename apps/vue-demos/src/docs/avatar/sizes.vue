<script setup lang="ts">
import { Avatar } from "../../components/ui/avatar";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 0.75rem">
    <div style="display: flex; gap: 0.75rem; align-items: center">
      <Avatar size="sm" alt="Ada Lovelace" />
      <Avatar size="md" alt="Ada Lovelace" />
      <Avatar size="lg" alt="Ada Lovelace" />
      <Avatar size="xl" alt="Ada Lovelace" />
      <Avatar size="lg" shape="square" alt="Acme Inc" />
    </div>
    <div style="display: flex; gap: 0.5rem; align-items: center">
      <Avatar size="sm" alt="" fallback="LT" />
      <span>Linus Torvalds</span>
    </div>
  </div>
</template>
