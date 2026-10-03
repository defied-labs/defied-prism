<script setup lang="ts">
import { provide } from "vue";
import { useControllableState } from "@defied/prism-vue";
import DropdownMenuGroup from "./DropdownMenuGroup.vue";
import { RadioGroupKey } from "./context";

export interface DropdownMenuRadioGroupProps {
  /** Checked item's value (v-model). */
  modelValue?: string | null;
  /** Checked item's value (controlled); the React-style alias of `modelValue`. */
  value?: string | null;
  /** Initially checked item's value (uncontrolled). */
  defaultValue?: string | null;
}

/** A group of mutually exclusive DropdownMenuRadioItems. */
const props = withDefaults(defineProps<DropdownMenuRadioGroupProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: null,
});
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();

const value = useControllableState<string | null>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue,
  onChange: (next) => {
    if (next === null) return;
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});

provide(RadioGroupKey, {
  value,
  setValue: (next) => {
    value.value = next;
  },
});
</script>

<template>
  <DropdownMenuGroup><slot /></DropdownMenuGroup>
</template>
