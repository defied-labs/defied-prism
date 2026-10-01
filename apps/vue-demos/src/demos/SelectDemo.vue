<script setup lang="ts">
import { ref } from "vue";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "../components/ui/select";

const stack = ref("vue");
</script>

<template>
  <Select v-model="stack">
    <SelectTrigger aria-label="Framework"><SelectValue placeholder="Pick a framework" /></SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Shipping today</SelectLabel>
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectItem value="svelte" disabled>Svelte (not yet)</SelectItem>
    </SelectContent>
  </Select>
</template>
