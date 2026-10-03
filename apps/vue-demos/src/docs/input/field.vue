<script setup lang="ts">
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
</script>

<template>
  <Field required>
    <FieldLabel>Email</FieldLabel>
    <Input type="email" name="email" placeholder="ada@example.com" />
    <FieldDescription>We only use it to send receipts.</FieldDescription>
  </Field>
</template>
