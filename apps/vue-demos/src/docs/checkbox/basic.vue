<script setup lang="ts">
import { Checkbox } from "../../components/ui/checkbox";
import { Field, FieldDescription } from "../../components/ui/field";
</script>

<template>
  <Field>
    <Checkbox name="terms" required>Accept the terms of service</Checkbox>
    <FieldDescription>You can withdraw consent in your account settings.</FieldDescription>
  </Field>
</template>
