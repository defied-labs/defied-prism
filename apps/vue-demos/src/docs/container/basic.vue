<script setup lang="ts">
import { Container } from "../../components/ui/container";
</script>

<template>
  <div style="width: 100%; border: 1px dashed currentColor">
    <Container size="sm" as="section" style="border: 1px solid currentColor">
      <p>This column stops growing at 40rem and stays centered. Resize the window: the dashed outer box
        follows it, the solid inner box doesn't.</p>
    </Container>
  </div>
</template>
