<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Radio, RadioGroup } from "../../components/ui/radio-group";

const plan = ref<string | null>("monthly");
</script>

<template>
  <Field>
    <FieldLabel>Billing</FieldLabel>
    <RadioGroup v-model="plan">
      <Radio value="monthly">Monthly</Radio>
      <Radio value="yearly">Yearly</Radio>
      <Radio value="lifetime" disabled>Lifetime</Radio>
    </RadioGroup>
    <FieldDescription>Selected: {{ plan }}</FieldDescription>
  </Field>
</template>
