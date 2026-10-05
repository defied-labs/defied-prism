<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { mergeFieldControlProps, useControllableState, useField } from "@defied-labs/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import styles from "./Switch.module.css";

export interface SwitchProps {
  /** Checked state (v-model). */
  modelValue?: boolean;
  /** Checked state (controlled); the React-style alias of `modelValue`. */
  checked?: boolean;
  /** Initially checked (uncontrolled). */
  defaultChecked?: boolean;
  size?: "sm" | "md";
  /** Submits `value` under this name when on (nothing when off, like a checkbox). */
  name?: string;
  value?: string;
  type?: "button" | "submit" | "reset";
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "track": { base: styles["track"], variants: {} }, "thumb": { base: styles["thumb"], variants: {} } };

defineOptions({ inheritAttrs: false });

// undefined defaults: absent booleans defer to the Field / stay uncontrolled
const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: undefined,
  checked: undefined,
  defaultChecked: false,
  size: "md",
  name: undefined,
  value: "on",
  type: "button",
  id: undefined,
  disabled: undefined,
  required: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [checked: boolean];
  "update:checked": [checked: boolean];
  checkedChange: [checked: boolean];
}>();

const attrs = useAttrs();
const field = useField();

const checked = useControllableState({
  value: () => props.modelValue ?? props.checked,
  defaultValue: props.defaultChecked,
  onChange: (next) => {
    emit("update:modelValue", next);
    emit("update:checked", next);
    emit("checkedChange", next);
  },
});

const variants = () => ({ size: props.size });

// Read in the render, so attribute, state and Field changes re-render the switch
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const { required, ...merged } = mergeFieldControlProps(field, {
    ...rest,
    id: props.id,
    disabled: props.disabled,
    required: props.required,
  } as Record<string, unknown> & { disabled?: boolean; required?: boolean });
  return {
    ...merged,
    disabled: merged.disabled ?? false,
    type: props.type,
    role: "switch",
    "aria-checked": checked.value,
    "aria-required": required || undefined,
    "data-state": checked.value ? "checked" : "unchecked",
    "data-slot": "switch",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

const partAttrs = (slot: "track" | "thumb") => ({
  "data-slot": `switch-${slot}`,
  ...variantData(variants()),
  class: slotClass(slots, slot, variants()),
});

// Runs after the caller's onClick, so it can preventDefault the toggle
function onClick(event: MouseEvent) {
  if (!event.defaultPrevented) checked.value = !checked.value;
}
</script>

<template>
  <button v-bind="rootAttrs()" @click="onClick">
    <span v-bind="partAttrs('track')"><span v-bind="partAttrs('thumb')" /></span>
    <slot />
    <input v-if="name && checked" type="hidden" :name="name" :value="value" />
  </button>
</template>
