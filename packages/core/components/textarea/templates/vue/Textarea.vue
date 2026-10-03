<script setup lang="ts">
import { normalizeClass, onMounted, ref, useAttrs, watch } from "vue";
import { mergeFieldControlProps, useField } from "@defied/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";

export interface TextareaProps {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  resize?: "none" | "vertical" | "both";
  fullWidth?: boolean;
  /** Grow (and shrink) the height with the content. */
  autoResize?: boolean;
  /** `v-model`; leave unset for an uncontrolled textarea. */
  modelValue?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

// id/disabled/required stay undefined when unset, so a surrounding Field supplies them
const props = withDefaults(defineProps<TextareaProps>(), {
  variant: "outlined",
  size: "md",
  resize: "vertical",
  fullWidth: false,
  autoResize: false,
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
const el = ref<HTMLTextAreaElement | null>(null);

function fitContent(target: HTMLTextAreaElement) {
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
}

// The first render and controlled value changes resize too
const fit = () => {
  if (props.autoResize && el.value) fitContent(el.value);
};
onMounted(fit);
watch(() => [props.autoResize, props.modelValue], fit, { flush: "post" });

const variants = () => ({
  variant: props.variant,
  size: props.size,
  resize: props.resize,
  fullWidth: props.fullWidth,
});

// Bind value only under v-model: Vue re-applies a bound `value` on every
// render, which would wipe what the user typed into an uncontrolled field.
const valueAttr = () => (props.modelValue === undefined ? {} : { value: props.modelValue });

// Read in the render, so attribute and Field changes re-render the textarea
const rootAttrs = () => {
  const { class: className, style, ...rest } = attrs;
  const merged = mergeFieldControlProps(field, {
    ...rest,
    id: props.id,
    disabled: props.disabled,
    required: props.required,
  } as Record<string, unknown> & { disabled?: boolean });
  return {
    ...valueAttr(),
    ...merged,
    disabled: merged.disabled ?? false,
    style: props.autoResize ? [{ overflow: "hidden" }, style] : style,
    "data-slot": "textarea",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

// Runs after the caller's onInput
function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  if (props.autoResize) fitContent(target);
}
</script>

<template>
  <textarea ref="el" v-bind="rootAttrs()" @input="onInput" />
</template>
