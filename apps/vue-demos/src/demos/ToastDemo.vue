<script setup lang="ts">
import { Button } from "../components/ui/button";
import { Toaster, toast } from "../components/ui/toast";
</script>

<template>
  <Button variant="secondary" @click="toast({ title: 'Deployed', description: 'Sent from a Vue component.', status: 'success' })">
    Show toast
  </Button>
  <Toaster position="top-end" label="Vue notifications" />
</template>
