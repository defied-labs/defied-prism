<script setup lang="ts">
import { normalizeClass, normalizeStyle, ref, useAttrs } from "vue";
import { mergeFieldControlProps, useControllableState, useField } from "@defied-labs/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import {
  clamp,
  fractionToValue,
  keyboardValue,
  pointerFraction,
  snapToStep,
  valueToPercent,
} from "@defied-labs/prism-core/components/slider";
import styles from "./Slider.module.css";

export interface SliderProps {
  /** Current value (v-model). */
  modelValue?: number;
  /** Current value (controlled); the React-style alias of `modelValue`. */
  value?: number;
  /** Initial value (uncontrolled); defaults to `min`. */
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** PageUp/PageDown amount; defaults to 10 steps. */
  largeStep?: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  disabled?: boolean;
  /** Submits the value under this name through a hidden input. */
  name?: string;
  /** Human-readable value for assistive tech, e.g. `(v) => \`${v}%\``. */
  getValueText?: (value: number) => string;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "track": { base: styles["track"], variants: {} }, "range": { base: styles["range"], variants: {} } };

defineOptions({ inheritAttrs: false });

// disabled stays undefined when unset, so a surrounding Field supplies it
const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  largeStep: undefined,
  orientation: "horizontal",
  size: "md",
  disabled: undefined,
  name: undefined,
  getValueText: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
  valueChange: [value: number];
  /** The final value when a drag ends or a key changes it. */
  valueCommit: [value: number];
}>();

const attrs = useAttrs();
const field = useField();

const raw = useControllableState<number>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue ?? props.min,
  onChange: (next) => {
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});

const trackRef = ref<HTMLElement | null>(null);
let dragging = false;

const range = () => ({ min: props.min, max: props.max, step: props.step });
const current = () => clamp(raw.value, props.min, props.max);
const variants = () => ({ orientation: props.orientation, size: props.size });

// Field supplies id, describedby, invalid and disabled; explicit values win
const control = () => {
  const { class: _class, style: _style, ...rest } = attrs;
  const merged = mergeFieldControlProps(field, {
    ...rest,
    disabled: props.disabled,
  } as Record<string, unknown> & { disabled?: boolean; required?: boolean });
  // aria-required isn't supported on role="slider"; a Field's required is dropped
  const { disabled = false, required: _required, ...others } = merged;
  return { disabled, others };
};
const isDisabled = () => control().disabled;

function valueAt(event: PointerEvent) {
  const target = trackRef.value ?? (event.currentTarget as HTMLElement);
  return fractionToValue(
    pointerFraction({ x: event.clientX, y: event.clientY }, target.getBoundingClientRect(), props.orientation),
    range(),
  );
}

function onKeyDown(event: KeyboardEvent) {
  if (isDisabled() || event.defaultPrevented) return;
  const value = current();
  const next = keyboardValue(event.key, value, { ...range(), largeStep: props.largeStep });
  if (next === null) return;
  event.preventDefault();
  raw.value = next;
  if (next !== value) emit("valueCommit", next);
}

function onPointerDown(event: PointerEvent) {
  if (isDisabled() || event.defaultPrevented || event.button !== 0) return;
  const el = event.currentTarget as HTMLElement;
  event.preventDefault(); // no text selection; focus explicitly instead
  el.focus();
  // Capture so the drag continues outside the track
  el.setPointerCapture?.(event.pointerId);
  dragging = true;
  raw.value = valueAt(event);
}

function onPointerMove(event: PointerEvent) {
  if (dragging) raw.value = valueAt(event);
}

function onPointerUp(event: PointerEvent) {
  if (!dragging) return;
  dragging = false;
  (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
  emit("valueCommit", valueAt(event));
}

function onPointerCancel() {
  dragging = false;
}

// Read in the render, so attribute and Field changes re-render the slider
const rootAttrs = () => {
  const { disabled, others } = control();
  const value = current();
  const labelledBy =
    (others["aria-labelledby"] as string | undefined) ??
    (field && !others["aria-label"] ? field.labelId : undefined);
  return {
    ...others,
    role: "slider",
    tabindex: disabled ? -1 : 0,
    "aria-labelledby": labelledBy,
    "aria-valuemin": props.min,
    "aria-valuemax": props.max,
    "aria-valuenow": value,
    "aria-valuetext": props.getValueText?.(value),
    "aria-orientation": props.orientation,
    "aria-disabled": disabled || undefined,
    "data-slot": "slider",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(attrs.class)),
    style: [
      normalizeStyle(attrs.style),
      { "--prism-slider-fraction": valueToPercent(value, props.min, props.max) / 100 },
    ],
  };
};
</script>

<template>
  <div
    v-bind="rootAttrs()"
    @keydown="onKeyDown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <span
      ref="trackRef"
      data-slot="slider-track"
      v-bind="variantData(variants())"
      :class="slotClass(slots, 'track', variants())"
    >
      <span
        data-slot="slider-range"
        v-bind="variantData(variants())"
        :class="slotClass(slots, 'range', variants())"
      />
    </span>
    <span data-part="thumb" aria-hidden="true" />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="snapToStep(current(), range())"
      :disabled="isDisabled()"
    />
  </div>
</template>
