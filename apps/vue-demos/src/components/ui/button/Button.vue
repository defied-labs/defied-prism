<script setup lang="ts">
import { normalizeClass, useAttrs, watch } from "vue";
import { useMachine } from "@defied-prism/vue";
import {
  buttonMachineDefinition,
  ButtonEvents,
} from "@defied-prism/core/components/button";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import styles from "./Button.module.css";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  fullWidth: false,
  loading: false,
  disabled: false,
  type: "button",
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const { status, send } = useMachine(buttonMachineDefinition);

// Props own disabled/loading; mirror them into the machine.
// Events that don't apply to the current state are ignored.
watch(
  () => [props.disabled, props.loading] as const,
  ([disabled, loading]) => {
    send(disabled ? ButtonEvents.disable() : ButtonEvents.enable());
    send(loading ? ButtonEvents.startLoading() : ButtonEvents.stopLoading());
  },
  { immediate: true },
);

const isPressKey = (key: string) => key === " " || key === "Enter";
const inert = () => props.disabled || props.loading;
const variants = () => ({ variant: props.variant, size: props.size, fullWidth: props.fullWidth });

// Read in the render, so attribute changes re-render the button
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    ...variantData(variants()),
    // A component composing this one (e.g. a dialog trigger) may name the slot
    "data-slot": (attrs["data-slot"] as string | undefined) ?? "button",
    "data-state": props.disabled ? "disabled" : props.loading ? "loading" : status.value,
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

function onClick(event: MouseEvent) {
  if (inert()) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}

function onPointerDown(event: PointerEvent) {
  if (!inert() && event.button === 0) {
    // Capture so the release is seen even if the pointer leaves the button
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    send(ButtonEvents.press());
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!inert() && !event.repeat && isPressKey(event.key)) send(ButtonEvents.press());
}

function onKeyUp(event: KeyboardEvent) {
  if (isPressKey(event.key)) send(ButtonEvents.release());
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
    @pointerdown="onPointerDown"
    @pointerup="send(ButtonEvents.release())"
    @pointercancel="send(ButtonEvents.release())"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @focus="send(ButtonEvents.focus())"
    @blur="send(ButtonEvents.blur())"
  >
    <span v-if="loading" data-part="spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
