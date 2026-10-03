<script setup lang="ts">
import { ref } from "vue";
import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
} from "../../components/ui/combobox";
import { Field, FieldLabel } from "../../components/ui/field";

const value = ref<string | null>("pear");
</script>

<template>
  <Field>
    <FieldLabel>Snack</FieldLabel>
    <Combobox v-model="value">
      <ComboboxInput />
      <ComboboxContent>
        <ComboboxGroup>
          <ComboboxLabel>Fruit</ComboboxLabel>
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="pear">Pear</ComboboxItem>
        </ComboboxGroup>
        <ComboboxGroup>
          <ComboboxLabel>Nuts</ComboboxLabel>
          <ComboboxItem value="almond">Almond</ComboboxItem>
          <ComboboxItem value="cashew" disabled>Cashew (sold out)</ComboboxItem>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
    <p>Value: {{ value ?? "none" }}</p>
  </Field>
</template>
