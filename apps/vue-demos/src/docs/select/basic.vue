<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";

const fruit = ref<string | null>(null);
</script>

<template>
  <Field>
    <FieldLabel>Fruit</FieldLabel>
    <Select v-model="fruit" placeholder="Pick a fruit">
      <SelectTrigger />
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="durian" disabled>Durian</SelectItem>
      </SelectContent>
    </Select>
    <FieldDescription>Selected: {{ fruit ?? "none" }}</FieldDescription>
  </Field>
</template>
