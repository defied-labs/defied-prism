<script setup lang="ts">
import { Field } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
</script>

<template>
  <Field required>
    <Label>Full name</Label>
    <Input name="name" autocomplete="name" />
  </Field>
</template>
