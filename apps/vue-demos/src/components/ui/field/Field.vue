<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { provideField, useFieldState } from "@defied-labs/prism-vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { useGroupDisabled } from "./context";

export interface FieldProps {
  orientation?: "vertical" | "horizontal";
  /** Id for the control; generated when omitted. */
  controlId?: string;
  /** Marks the control invalid. A rendered FieldError does this too. */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Connects a label, description and error message to the Prism form control
 * inside it (id, aria-describedby, aria-invalid, disabled, required).
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FieldProps>(), {
  orientation: "vertical",
  invalid: false,
  disabled: false,
  required: false,
});

const attrs = useAttrs();
// A disabled FieldGroup disables its controls natively; tell the Field so labels dim too
const groupDisabled = useGroupDisabled();
const field = useFieldState({
  id: () => props.controlId,
  invalid: () => props.invalid,
  disabled: () => props.disabled || groupDisabled(),
  required: () => props.required,
});
provideField(field);

// Read in the render, so attribute changes re-render the field
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = { orientation: props.orientation };
  return {
    ...rest,
    "data-slot": "field",
    "data-invalid": field.invalid || undefined,
    "data-disabled": field.disabled || undefined,
    ...variantData(variants),
    class: slotClass(slots, "root", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
