<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { Label } from "../label";
import { slots } from "./styles";

export interface FieldLabelProps {
  /** Shows the required marker. Defaults to the Field's `required`. */
  required?: boolean;
}

/**
 * Labels the Field's control: the registry Label (which reads id, for,
 * required and disabled from the Field) tagged as the Field's label slot.
 * The asterisk is visual; the control carries `required`.
 */
// undefined (not false) when absent, so the Field's value applies
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FieldLabelProps>(), { required: undefined });
const attrs = useAttrs();

const labelAttrs = () => {
  const { class: className, ...rest } = attrs;
  return { ...rest, class: slotClass(slots, "label", {}, normalizeClass(className)) };
};
</script>

<template>
  <Label v-bind="labelAttrs()" :required="props.required" data-slot="field-label"><slot /></Label>
</template>
