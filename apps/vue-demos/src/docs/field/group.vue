<script setup lang="ts">
import { Field, FieldGroup, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
</script>

<template>
  <FieldGroup legend="Shipping address" disabled>
    <Field>
      <FieldLabel>Street</FieldLabel>
      <Input name="street" model-value="12 Analytical Row" />
    </Field>
    <Field>
      <FieldLabel>City</FieldLabel>
      <Input name="city" model-value="London" />
    </Field>
  </FieldGroup>
</template>
