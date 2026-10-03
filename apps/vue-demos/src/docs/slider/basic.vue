<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Slider } from "../../components/ui/slider";

const volume = ref(40);
const valueText = (v: number) => `${v}%`;
</script>

<template>
  <Field style="width: 100%; max-width: 20rem">
    <FieldLabel>Volume</FieldLabel>
    <Slider v-model="volume" :get-value-text="valueText" />
    <FieldDescription>Volume: {{ volume }}%</FieldDescription>
  </Field>
</template>
