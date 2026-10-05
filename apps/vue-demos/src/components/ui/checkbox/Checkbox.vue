<script setup lang="ts">
import { normalizeClass, onMounted, ref, useAttrs, watch } from "vue";
import { mergeFieldControlProps, useControllableState, useField } from "@defied-labs/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  /** Checked state (v-model). */
  modelValue?: boolean;
  /** Checked state (controlled); the React-style alias of `modelValue`. */
  checked?: boolean;
  /** Initially checked (uncontrolled). */
  defaultChecked?: boolean;
  /** Mixed state ("some selected"). Controlled: stays on until you clear it. */
  indeterminate?: boolean;
  size?: "sm" | "md";
  /** Class for the wrapping <label>; `class` styles the box. */
  labelClass?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "label": { base: styles["label"], variants: {} }, "control": { base: styles["control"], variants: {} } };

defineOptions({ inheritAttrs: false });

// undefined defaults: absent booleans defer to the Field / stay uncontrolled
const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: undefined,
  checked: undefined,
  defaultChecked: false,
  indeterminate: false,
  size: "md",
  labelClass: undefined,
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
const input = ref<HTMLInputElement | null>(null);

const checked = useControllableState({
  value: () => props.modelValue ?? props.checked,
  defaultValue: props.defaultChecked,
  onChange: (next) => {
    emit("update:modelValue", next);
    emit("update:checked", next);
    emit("checkedChange", next);
  },
});

// `indeterminate` and a controlled `checked` live on the DOM node: re-apply
// them after every toggle, because the browser changes both on click.
const sync = () => {
  if (!input.value) return;
  input.value.checked = checked.value;
  input.value.indeterminate = props.indeterminate;
};
onMounted(sync);
watch(() => [props.indeterminate, checked.value], sync, { flush: "post" });

const variants = () => ({ size: props.size });
const state = () =>
  props.indeterminate ? "indeterminate" : checked.value ? "checked" : "unchecked";

const partAttrs = (slot: "label" | "control", className?: string) => ({
  "data-slot": `checkbox-${slot}`,
  ...variantData(variants()),
  class: slotClass(slots, slot, variants(), className),
});

// Read in the render, so attribute, state and Field changes re-render the box
const inputAttrs = () => {
  const { class: className, ...rest } = attrs;
  const merged = mergeFieldControlProps(field, {
    ...rest,
    id: props.id,
    disabled: props.disabled,
    required: props.required,
  } as Record<string, unknown> & { disabled?: boolean });
  return {
    ...merged,
    disabled: merged.disabled ?? false,
    type: "checkbox",
    checked: checked.value,
    "aria-checked": props.indeterminate ? ("mixed" as const) : undefined,
    "data-state": state(),
    "data-slot": "checkbox",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

// Runs after the caller's onChange
function onChange(event: Event) {
  checked.value = (event.target as HTMLInputElement).checked;
  sync();
}
</script>

<template>
  <label v-bind="partAttrs('label', labelClass)">
    <span v-bind="partAttrs('control')">
      <input ref="input" v-bind="inputAttrs()" @change="onChange" />
      <span
        v-if="state() !== 'unchecked'"
        data-part="indicator"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 16 16"
          width="75%"
          height="75%"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-if="state() === 'indeterminate'" key="dash" data-part="mark" pathLength="1" d="M3.5 8h9" />
          <path v-else key="tick" data-part="mark" pathLength="1" d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
    </span>
    <slot />
  </label>
</template>
