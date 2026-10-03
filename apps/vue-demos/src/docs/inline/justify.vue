<script setup lang="ts">
import { Button } from "../../components/ui/button";
import { Inline } from "../../components/ui/inline";
</script>

<template>
  <Inline as="footer" justify="between" style="width: 100%">
    <span>3 items selected</span>
    <Inline gap="sm">
      <Button variant="ghost">Cancel</Button>
      <Button>Archive</Button>
    </Inline>
  </Inline>
</template>
