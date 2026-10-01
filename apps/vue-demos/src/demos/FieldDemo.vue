<script setup lang="ts">
import { computed, ref } from "vue";
import { Field, FieldDescription, FieldError, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";

const email = ref("");
const invalid = computed(() => email.value.length > 0 && !email.value.includes("@"));
</script>

<template>
  <Field :invalid="invalid">
    <FieldLabel>Work email</FieldLabel>
    <Input v-model="email" type="email" placeholder="you@company.com" />
    <FieldDescription>We only use it for release notes.</FieldDescription>
    <FieldError v-if="invalid">That doesn't look like an email address.</FieldError>
  </Field>
</template>
