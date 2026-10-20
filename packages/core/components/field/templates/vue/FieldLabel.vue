<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { useField } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";

export interface FieldLabelProps {
  /** Shows the required marker. Defaults to the Field's `required`. */
  required?: boolean;
}

/** Labels the Field's control. The asterisk is visual; the control carries `required`. */
defineOptions({ inheritAttrs: false });

// undefined (not false) when absent, so the Field's value applies
const props = withDefaults(defineProps<FieldLabelProps>(), { required: undefined });

const attrs = useAttrs();
const field = useField();

const isRequired = () => props.required ?? field?.required ?? false;

const rootAttrs = () => {
  const { class: className, id, for: htmlFor, htmlFor: reactFor, ...rest } = attrs;
  return {
    ...rest,
    id: (id as string | undefined) ?? field?.labelId,
    for: ((htmlFor ?? reactFor) as string | undefined) ?? field?.controlId,
    "data-slot": "field-label",
    ...variantData({}),
    class: slotClass(slots, "label", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <label v-bind="rootAttrs()">
    <slot />
    <span v-if="isRequired()" data-part="required-indicator" aria-hidden="true">*</span>
  </label>
</template>
