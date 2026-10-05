<script setup lang="ts">
import { normalizeClass, ref, useAttrs, watch } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { useRadioGroup } from "./context";
import { slots } from "./styles";

export interface RadioProps {
  value: string;
  disabled?: boolean;
  /** Class for the wrapping <label>; `class` styles the radio circle. */
  labelClass?: string;
}

/** One native radio with its clickable label (the default slot). */
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<RadioProps>(), { disabled: false, labelClass: undefined });

const attrs = useAttrs();
const group = useRadioGroup("Radio");
const inputRef = ref<HTMLInputElement | null>(null);
const isChecked = () => group.value.value === props.value;

// The browser toggles radios itself; after each change, match the DOM to the
// (possibly controlled) value, which a re-render alone wouldn't patch back
watch(
  [() => group.revision.value, isChecked],
  () => {
    if (inputRef.value) inputRef.value.checked = isChecked();
  },
  { flush: "post" },
);

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!event.defaultPrevented && target.checked) group.setValue(props.value);
}

const variants = () => group.variants.value;

// Read in the render, so attribute changes re-render the radio
const inputAttrs = () => {
  const { class: className, ...rest } = attrs;
  const checked = isChecked();
  return {
    ...rest,
    type: "radio",
    name: group.name.value,
    value: props.value,
    checked,
    disabled: group.disabled() || props.disabled,
    required: group.required() || undefined,
    "aria-invalid": group.invalid() || undefined,
    "data-state": checked ? "checked" : "unchecked",
    "data-slot": "radio-group-radio",
    ...variantData(variants()),
    class: slotClass(slots, "radio", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <label
    data-slot="radio-group-item"
    v-bind="variantData(variants())"
    :class="slotClass(slots, 'item', variants(), labelClass)"
  >
    <span
      data-slot="radio-group-control"
      v-bind="variantData(variants())"
      :class="slotClass(slots, 'control', variants())"
    >
      <input ref="inputRef" v-bind="inputAttrs()" @change="onChange" />
      <span v-if="isChecked()" data-part="indicator" aria-hidden="true" />
    </span>
    <slot />
  </label>
</template>
