<script setup lang="ts">
import { normalizeClass, useAttrs, watch } from "vue";
import { mergeFieldControlProps, useField, useMachine } from "@defied-labs/prism-vue";
import {
  inputMachineDefinition,
  InputEvents,
} from "@defied-labs/prism-core/components/input";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import styles from "./Input.module.css";

export interface InputProps {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** `v-model`; leave unset for an uncontrolled input. */
  modelValue?: string | number;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

// id/disabled/required stay undefined when unset, so a surrounding Field supplies them
const props = withDefaults(defineProps<InputProps>(), {
  variant: "outlined",
  size: "md",
  fullWidth: false,
  modelValue: undefined,
  id: undefined,
  disabled: undefined,
  required: undefined,
});

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const attrs = useAttrs();
// Labels, descriptions and errors belong to Field: inside one, it supplies
// id, aria-describedby, aria-invalid, disabled and required; explicit props win.
const field = useField();

// The DOM (or the caller, with v-model) owns the value; the machine only
// tracks focus / filled / disabled for data-state.
const { status, send } = useMachine(inputMachineDefinition);

const controlProps = () => {
  const { class: _class, ...rest } = attrs;
  return mergeFieldControlProps(field, {
    ...rest,
    id: props.id,
    disabled: props.disabled,
    required: props.required,
  } as Record<string, unknown> & { disabled?: boolean });
};

watch(
  () => controlProps().disabled ?? false,
  (disabled) => send(disabled ? InputEvents.disable() : InputEvents.enable()),
  { immediate: true },
);

const variants = () => ({ variant: props.variant, size: props.size, fullWidth: props.fullWidth });

// Bind value only under v-model: Vue re-applies a bound `value` on every
// render, which would wipe what the user typed into an uncontrolled field.
const valueAttr = () => (props.modelValue === undefined ? {} : { value: props.modelValue });

// Read in the render, so attribute and Field changes re-render the input
const rootAttrs = () => {
  const merged = controlProps();
  return {
    ...valueAttr(),
    ...merged,
    disabled: merged.disabled ?? false,
    ...variantData(variants()),
    "data-state": status.value,
    "data-slot": "input",
    class: slotClass(slots, "root", variants(), normalizeClass(attrs.class)),
  };
};

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  send(InputEvents.change(value));
  emit("update:modelValue", value);
}
</script>

<template>
  <input
    v-bind="rootAttrs()"
   
    @input="onInput"
    @focus="send(InputEvents.focus())"
    @blur="send(InputEvents.blur())"
  />
</template>
