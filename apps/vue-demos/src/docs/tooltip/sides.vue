<script setup lang="ts">
import { Button } from "../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";

const sides = ["top", "right", "bottom", "left"] as const;
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
    <Tooltip v-for="side in sides" :key="side" :open-delay="0">
      <TooltipTrigger as-child>
        <Button variant="outline">{{ side }}</Button>
      </TooltipTrigger>
      <TooltipContent :side="side">Shown on the {{ side }}</TooltipContent>
    </Tooltip>
  </div>
</template>
