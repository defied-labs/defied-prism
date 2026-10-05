<script setup lang="ts">
import { computed, normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { mergeFieldControlProps, useControllableState, useField } from "@defied-labs/prism-vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { RadioGroupContext, type Variants } from "./context";
import { slots } from "./styles";

export interface RadioGroupProps {
  /** Selected value (v-model); `null` for none. */
  modelValue?: string | null;
  /** Selected value (controlled); the React-style alias of `modelValue`. */
  value?: string | null;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string | null;
  /** Form field name shared by the radios; generated when omitted. */
  name?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  disabled?: boolean;
  required?: boolean;
}

/**
 * Native radios sharing a `name`: the browser provides arrow-key selection,
 * a single tab stop and form submission. Name it with aria-label,
 * aria-labelledby or a surrounding Field.
 */
defineOptions({ inheritAttrs: false });

// undefined defaults: absent booleans defer to the Field / stay uncontrolled
const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: null,
  name: undefined,
  orientation: "vertical",
  size: "md",
  disabled: undefined,
  required: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();
const field = useField();
const generatedName = useId();

const value = useControllableState<string | null>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue,
  onChange: (next) => {
    if (next === null) return;
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});
const revision = ref(0);

// Field supplies id, describedby, invalid, disabled and required; explicit values win
const control = () => {
  const { class: _class, ...rest } = attrs;
  return mergeFieldControlProps(field, {
    ...rest,
    disabled: props.disabled,
    required: props.required,
  } as Record<string, unknown> & {
    disabled?: boolean;
    required?: boolean;
    "aria-invalid"?: boolean | "true" | "false";
  });
};
const variants = computed<Variants>(() => ({ orientation: props.orientation, size: props.size }));
const isInvalid = (v: unknown) => v === true || v === "true";

provide(RadioGroupContext, {
  name: computed(() => props.name ?? generatedName),
  value,
  setValue: (next) => {
    value.value = next;
    revision.value++;
  },
  revision,
  disabled: () => control().disabled ?? false,
  required: () => control().required ?? false,
  invalid: () => isInvalid(control()["aria-invalid"]),
  variants,
});

// Read in the render, so attribute and Field changes re-render the group
const rootAttrs = () => {
  const { disabled = false, required = false, "aria-invalid": ariaInvalid, ...rest } = control();
  const labelledBy =
    (rest["aria-labelledby"] as string | undefined) ??
    (field && !rest["aria-label"] ? field.labelId : undefined);
  return {
    ...rest,
    role: "radiogroup",
    "aria-labelledby": labelledBy,
    "aria-orientation": props.orientation,
    "aria-invalid": isInvalid(ariaInvalid) || undefined,
    "aria-required": required || undefined,
    "aria-disabled": disabled || undefined,
    "data-slot": "radio-group",
    ...variantData(variants.value),
    class: slotClass(slots, "root", variants.value, normalizeClass(attrs.class)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
