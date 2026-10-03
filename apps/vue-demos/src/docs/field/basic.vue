<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";

const username = ref("ada");
</script>

<template>
  <Field required>
    <FieldLabel>Username</FieldLabel>
    <Input v-model="username" name="username" />
    <FieldDescription>Shown on your public profile.</FieldDescription>
  </Field>
</template>
