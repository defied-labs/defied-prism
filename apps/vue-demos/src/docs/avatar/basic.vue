<script setup lang="ts">
import { Avatar } from "../../components/ui/avatar";

const photo =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%236366f1%22/%3E%3Ccircle cx=%2232%22 cy=%2226%22 r=%2212%22 fill=%22%23e0e7ff%22/%3E%3Cpath d=%22M10 64c2-14 12-22 22-22s20 8 22 22%22 fill=%22%23e0e7ff%22/%3E%3C/svg%3E";
</script>

<template>
  <div style="display: flex; gap: 0.75rem; align-items: center">
    <Avatar :src="photo" alt="Grace Hopper" />
    <Avatar alt="Ada Lovelace" />
    <Avatar src="/missing.png" alt="Alan Turing" />
  </div>
</template>
