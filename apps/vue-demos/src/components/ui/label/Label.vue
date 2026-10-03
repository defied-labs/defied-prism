<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { useField } from "@defied-prism/vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import styles from "./Label.module.css";

export interface LabelProps {
  size?: "sm" | "md";
  /** Shows a required marker. Defaults to the surrounding Field's `required`. */
  required?: boolean;
  /** Disabled look. Defaults to the surrounding Field's `disabled`. */
  disabled?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

/**
 * A form label. Inside a Field it labels the Field's control automatically
 * (id = field.labelId, for = field.controlId) unless given explicitly.
 * The required asterisk is visual only: the control carries `required`.
 */
defineOptions({ inheritAttrs: false });

// undefined (not false) when absent, so the Field's value applies
const props = withDefaults(defineProps<LabelProps>(), {
  size: "md",
  required: undefined,
  disabled: undefined,
});

const attrs = useAttrs();
const field = useField();

const isRequired = () => props.required ?? field?.required ?? false;
const variants = () => ({ size: props.size, dimmed: props.disabled ?? field?.disabled ?? false });

// Read in the render, so attribute and Field changes re-render the label
const rootAttrs = () => {
  const { class: className, id, for: htmlFor, htmlFor: reactFor, ...rest } = attrs;
  return {
    ...rest,
    id: (id as string | undefined) ?? field?.labelId,
    for: ((htmlFor ?? reactFor) as string | undefined) ?? field?.controlId,
    "data-slot": "label",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <label v-bind="rootAttrs()">
    <slot />
    <span v-if="isRequired()" data-part="required-indicator" aria-hidden="true">*</span>
  </label>
</template>
