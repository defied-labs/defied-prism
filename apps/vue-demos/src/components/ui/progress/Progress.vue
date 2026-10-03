<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { clampProgress } from "./clamp";
import styles from "./Progress.module.css";

/** Name it with `aria-label` or `aria-labelledby`. */
export interface ProgressProps {
  /** Current value; clamped to [min, max]. `null` means indeterminate. */
  value?: number | null;
  min?: number;
  max?: number;
  /** Unknown progress: no aria-valuenow, animated bar. */
  indeterminate?: boolean;
  /** Human-readable value, e.g. "3 of 10 files". Defaults to the percentage. */
  valueText?: string | ((value: number, percent: number) => string);
  status?: "neutral" | "info" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "indicator": { base: styles["indicator"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  min: 0,
  max: 100,
  indeterminate: false,
  valueText: undefined,
  status: "info",
  size: "md",
});

const attrs = useAttrs();

const view = () => {
  const indeterminate = props.indeterminate || props.value === null;
  const upper = Math.max(props.min, props.max);
  const current = clampProgress(props.value ?? props.min, props.min, upper);
  const percent = upper === props.min ? 100 : ((current - props.min) / (upper - props.min)) * 100;
  const variants = { status: props.status, size: props.size, indeterminate };
  const text = indeterminate
    ? undefined
    : typeof props.valueText === "function"
      ? props.valueText(current, percent)
      : props.valueText;
  const state = indeterminate ? "indeterminate" : current >= upper ? "complete" : "determinate";
  return { indeterminate, upper, current, percent, variants, text, state };
};

// Read in the render, so prop and attribute changes re-render the bar
const rootAttrs = () => {
  const v = view();
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    role: "progressbar",
    "aria-valuemin": props.min,
    "aria-valuemax": v.upper,
    "aria-valuenow": v.indeterminate ? undefined : v.current,
    "aria-valuetext": v.text,
    "data-state": v.state,
    "data-slot": "progress",
    ...variantData(v.variants),
    class: slotClass(slots, "root", v.variants, normalizeClass(className)),
  };
};

const indicatorAttrs = () => {
  const v = view();
  return {
    "data-slot": "progress-indicator",
    "data-state": v.state,
    ...variantData(v.variants),
    class: slotClass(slots, "indicator", v.variants),
    style: { width: v.indeterminate ? "40%" : `${v.percent}%` },
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><div v-bind="indicatorAttrs()" /></div>
</template>
