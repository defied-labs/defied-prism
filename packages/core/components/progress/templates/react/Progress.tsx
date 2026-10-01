import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type ProgressName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type ProgressProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "aria-valuetext"
> &
  ProgressName & {
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
  };

/** Clamp `value` into [min, max] (min wins if the range is inverted). */
export function clampProgress(value: number, min: number, max: number): number {
  const hi = Math.max(min, max);
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), hi);
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      indeterminate: indeterminateProp = false,
      valueText,
      status = "info",
      size = "md",
      className,
      ...props
    },
    ref,
  ) => {
    const indeterminate = indeterminateProp || value === null;
    const upper = Math.max(min, max);
    const current = clampProgress(value ?? min, min, upper);
    const percent = upper === min ? 100 : ((current - min) / (upper - min)) * 100;
    const variants = { status, size, indeterminate };
    const text = indeterminate
      ? undefined
      : typeof valueText === "function"
        ? valueText(current, percent)
        : valueText;
    const state = indeterminate ? "indeterminate" : current >= upper ? "complete" : "determinate";

    return (
      <div
        {...props}
        ref={ref}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={upper}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={text}
        data-state={state}
        data-slot="progress"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      >
        <div
          data-slot="progress-indicator"
          data-state={state}
          {...variantData(variants)}
          className={slotClass(slots, "indicator", variants)}
          style={{ width: indeterminate ? "40%" : `${percent}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
