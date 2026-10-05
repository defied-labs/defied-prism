<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, ref, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import styles from "./Form.module.css";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

export interface FormProps {
  /** After submit, focus the first invalid control. Default true. */
  focusInvalid?: boolean;
}

const INVALID = '[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid';

/**
 * A <form>. After `@submit` runs and its updates render (e.g. new
 * FieldErrors), focus moves to the first control marked invalid.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FormProps>(), { focusInvalid: true });
const emit = defineEmits<{ submit: [event: SubmitEvent] }>();

const attrs = useAttrs();
const formEl = ref<HTMLFormElement | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(timer));

function onSubmit(event: Event) {
  emit("submit", event as SubmitEvent);
  if (!props.focusInvalid) return;
  // After the submit's re-renders settle (errors render, then FieldErrors
  // mark their controls invalid)
  clearTimeout(timer);
  timer = setTimeout(() => {
    const target = Array.from(formEl.value?.querySelectorAll<HTMLElement>(INVALID) ?? []).find(
      (el) => !(el as HTMLInputElement).disabled && el.getAttribute("aria-disabled") !== "true",
    );
    target?.focus();
  });
}

// Read in the render, so attribute changes re-render the form
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "form",
    ...variantData({}),
    class: slotClass(slots, "root", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <form ref="formEl" v-bind="rootAttrs()" @submit="onSubmit"><slot /></form>
</template>
