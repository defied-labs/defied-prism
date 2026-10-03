<script setup lang="ts">
import { reactive, ref } from "vue";
import { Button } from "../../components/ui/button";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Form } from "../../components/ui/form";
import { Input } from "../../components/ui/input";

const name = ref("");
const email = ref("");
const errors = reactive<{ name?: string; email?: string }>({});
const sent = ref(false);

function onSubmit(event: Event) {
  event.preventDefault();
  errors.name = name.value.trim() ? undefined : "Enter your name.";
  errors.email = email.value.includes("@") ? undefined : "Enter an email address like ada@example.com.";
  sent.value = !errors.name && !errors.email;
}
</script>

<template>
  <Form novalidate @submit="onSubmit">
    <Field required>
      <FieldLabel>Name</FieldLabel>
      <Input v-model="name" name="name" />
      <FieldError>{{ errors.name }}</FieldError>
    </Field>
    <Field required>
      <FieldLabel>Email</FieldLabel>
      <Input v-model="email" name="email" type="email" />
      <FieldError>{{ errors.email }}</FieldError>
    </Field>
    <Button type="submit">Join waitlist</Button>
    <p v-if="sent">Thanks, you're on the list.</p>
  </Form>
</template>
