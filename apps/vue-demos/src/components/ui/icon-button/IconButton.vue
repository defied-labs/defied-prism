<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import styles from "./IconButton.module.css";

/**
 * Pass `aria-label`: an icon-only button has no visible text to name it.
 * It falls through as an attribute (a declared prop would be camel-cased).
 */
export interface IconButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: "ghost",
  size: "md",
  loading: false,
  disabled: false,
  type: "button",
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const variants = () => ({ variant: props.variant, size: props.size });

// Read in the render, so attribute changes re-render the button
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    ...variantData(variants()),
    // A component composing this one (e.g. a dialog trigger) may name the slot
    "data-slot": (attrs["data-slot"] as string | undefined) ?? "icon-button",
    "data-state": props.disabled ? "disabled" : props.loading ? "loading" : "idle",
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <button
    v-bind="rootAttrs()"
    :type="type"
    :disabled="disabled"
    :aria-disabled="loading || undefined"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" data-part="spinner" aria-hidden="true" />
    <span v-else data-part="icon" aria-hidden="true"><slot /></span>
  </button>
</template>
