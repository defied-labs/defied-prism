<script setup lang="ts">
import { Button } from "../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="outline">Publish</Button>
    </TooltipTrigger>
    <TooltipContent>Makes the page visible to everyone</TooltipContent>
  </Tooltip>
</template>
