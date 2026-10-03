<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Slider } from "../../components/ui/slider";

const saved = ref(1000);
</script>

<template>
  <Field style="width: 100%; max-width: 20rem">
    <FieldLabel>Max price</FieldLabel>
    <Slider :default-value="1000" :min="0" :max="5000" :step="100" @value-commit="saved = $event" />
    <FieldDescription>Saved: {{ saved }} EUR</FieldDescription>
  </Field>
</template>
