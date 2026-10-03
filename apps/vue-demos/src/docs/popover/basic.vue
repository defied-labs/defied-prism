<script setup lang="ts">
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
</script>

<template>
  <Popover>
    <PopoverTrigger>Share</PopoverTrigger>
    <PopoverContent>
      <p>Anyone with the link can view this page.</p>
      <label>Link <input readonly value="https://example.com/p/42" /></label>
      <PopoverClose>Done</PopoverClose>
    </PopoverContent>
  </Popover>
</template>
