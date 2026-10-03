<script setup lang="ts">
import { Radio, RadioGroup } from "../../components/ui/radio-group";
</script>

<template>
  <RadioGroup aria-label="Size" orientation="horizontal" size="sm" default-value="m">
    <Radio value="s">S</Radio>
    <Radio value="m">M</Radio>
    <Radio value="l">L</Radio>
  </RadioGroup>
</template>
