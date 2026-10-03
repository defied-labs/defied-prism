<script setup lang="ts">
import { ref } from "vue";
import { Field, FieldDescription, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";

const username = ref("ada");
</script>

<template>
  <Field>
    <FieldLabel>Username</FieldLabel>
    <Input v-model="username" />
    <FieldDescription>Your profile: prism.dev/{{ username || "…" }}</FieldDescription>
  </Field>
</template>
