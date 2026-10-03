<script setup lang="ts">
import { computed, ref } from "vue";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";

const slug = ref("My Project");
const error = computed(() => (/^[a-z0-9-]+$/.test(slug.value) ? "" : "Use lowercase letters, numbers and dashes."));
</script>

<template>
  <Field>
    <FieldLabel>Project URL</FieldLabel>
    <Input v-model="slug" name="slug" />
    <FieldError>{{ error }}</FieldError>
  </Field>
</template>
