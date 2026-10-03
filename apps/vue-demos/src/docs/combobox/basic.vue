<script setup lang="ts">
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from "../../components/ui/combobox";
import { Field, FieldLabel } from "../../components/ui/field";

const timezones = ["Europe/Rome", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"];
</script>

<template>
  <Field>
    <FieldLabel>Time zone</FieldLabel>
    <Combobox name="timezone">
      <ComboboxInput placeholder="Search time zones" />
      <ComboboxContent>
        <ComboboxItem v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</ComboboxItem>
      </ComboboxContent>
      <ComboboxEmpty>No time zone found</ComboboxEmpty>
    </Combobox>
  </Field>
</template>
