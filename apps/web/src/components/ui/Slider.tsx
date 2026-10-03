import {
  forwardRef,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  useControllableState,
  useField,
  useFieldControlProps,
} from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  clamp,
  fractionToValue,
  keyboardValue,
  pointerFraction,
  snapToStep,
  valueToPercent,
} from "@defied-prism/core/components/slider";
import { tailwindSlots } from "@defied-prism/core/tailwind";

export interface SliderProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "aria-invalid" | "role"
  > {
  /** Current value (controlled). */
  value?: number;
  /** Initial value (uncontrolled); defaults to `min`. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Called with the final value when a drag ends or a key changes it. */
  onValueCommit?: (value: number) => void;
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
  "aria-invalid"?: boolean | "true" | "false";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative flex items-center justify-center box-border shrink-0 [touch-action:none] select-none cursor-pointer focus-visible:[outline:none] focus-visible:[&_[data-part=thumb]]:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[&_[data-part=thumb]]:[outline-offset:var(--prism-focus-ring-offset)] aria-disabled:opacity-(--prism-opacity-disabled) aria-disabled:cursor-not-allowed [&_[data-part=thumb]]:absolute [&_[data-part=thumb]]:box-border [&_[data-part=thumb]]:[width:var(--prism-slider-thumb)] [&_[data-part=thumb]]:[height:var(--prism-slider-thumb)] [&_[data-part=thumb]]:rounded-prism-full [&_[data-part=thumb]]:[border-width:2px] [&_[data-part=thumb]]:border-solid [&_[data-part=thumb]]:border-prism-primary [&_[data-part=thumb]]:bg-prism-bg [&_[data-part=thumb]]:shadow-prism-sm [&_[data-part=thumb]]:pointer-events-none",
    "variants": {
      "orientation": {
        "horizontal": "flex-row w-full [min-width:8rem] [height:var(--prism-slider-thumb)] [padding-block:calc((var(--prism-slider-thumb)_-_var(--prism-slider-track))_/_2)] [padding-inline:0] [&_[data-part=thumb]]:[left:calc(var(--prism-slider-fraction,_0)_*_(100%_-_var(--prism-slider-thumb)))] [&_[data-part=thumb]]:[top:0]",
        "vertical": "flex-col [width:var(--prism-slider-thumb)] [min-width:0] [height:8rem] [padding-inline:calc((var(--prism-slider-thumb)_-_var(--prism-slider-track))_/_2)] [padding-block:0] [&_[data-part=thumb]]:[top:calc((1_-_var(--prism-slider-fraction,_0))_*_(100%_-_var(--prism-slider-thumb)))] [&_[data-part=thumb]]:[left:0]"
      },
      "size": {
        "sm": "[--prism-slider-thumb:1rem] [--prism-slider-track:0.25rem]",
        "md": "[--prism-slider-thumb:1.25rem] [--prism-slider-track:0.375rem]"
      }
    }
  },
  "track": {
    "base": "relative grow [align-self:stretch] overflow-hidden rounded-prism-full bg-prism-muted",
    "variants": {}
  },
  "range": {
    "base": "absolute bg-prism-primary",
    "variants": {
      "orientation": {
        "horizontal": "[top:0] [bottom:0] [left:0] [width:calc(var(--prism-slider-fraction,_0)_*_100%)] [height:auto]",
        "vertical": "[left:0] [right:0] [bottom:0] [height:calc(var(--prism-slider-fraction,_0)_*_100%)] [width:auto]"
      }
    }
  }
});

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      largeStep,
      orientation = "horizontal",
      size = "md",
      disabled: disabledProp,
      name,
      getValueText,
      className,
      style,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...ownProps
    },
    ref,
  ) => {
    const field = useField();
    const { disabled = false, ...props } = useFieldControlProps<
      typeof ownProps & { disabled?: boolean; required?: boolean }
    >({ ...ownProps, disabled: disabledProp });
    // aria-required isn't supported on role="slider"; a Field's required is dropped
    delete props.required;
    const range = { min, max, step };
    const [rawValue, setValue] = useControllableState({
      value: valueProp,
      defaultValue: defaultValue ?? min,
      onChange: onValueChange,
    });
    const value = clamp(rawValue, min, max);
    const trackRef = useRef<HTMLSpanElement>(null);
    const dragging = useRef(false);
    const variants = { orientation, size };
    const fraction = valueToPercent(value, min, max) / 100;

    const labelledBy =
      props["aria-labelledby"] ??
      (field && !props["aria-label"] ? field.labelId : undefined);

    const valueAt = (event: PointerEvent<HTMLDivElement>) => {
      const rect = (trackRef.current ?? event.currentTarget).getBoundingClientRect();
      return fractionToValue(
        pointerFraction({ x: event.clientX, y: event.clientY }, rect, orientation),
        range,
      );
    };

    return (
      <div
        {...props}
        ref={ref}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={labelledBy}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={getValueText?.(value)}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        data-slot="slider"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        style={{ ...style, "--prism-slider-fraction": fraction } as CSSProperties}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (disabled || event.defaultPrevented) return;
          const next = keyboardValue(event.key, value, { ...range, largeStep });
          if (next === null) return;
          event.preventDefault();
          setValue(next);
          if (next !== value) onValueCommit?.(next);
        }}
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
          onPointerDown?.(event);
          if (disabled || event.defaultPrevented || event.button !== 0) return;
          event.preventDefault(); // no text selection; focus explicitly instead
          event.currentTarget.focus();
          // Capture so the drag continues outside the track
          event.currentTarget.setPointerCapture?.(event.pointerId);
          dragging.current = true;
          setValue(valueAt(event));
        }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          onPointerMove?.(event);
          if (dragging.current) setValue(valueAt(event));
        }}
        onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
          onPointerUp?.(event);
          if (!dragging.current) return;
          dragging.current = false;
          event.currentTarget.releasePointerCapture?.(event.pointerId);
          onValueCommit?.(valueAt(event));
        }}
        onPointerCancel={(event: PointerEvent<HTMLDivElement>) => {
          onPointerCancel?.(event);
          dragging.current = false;
        }}
      >
        <span
          ref={trackRef}
          data-slot="slider-track"
          {...variantData(variants)}
          className={slotClass(slots, "track", variants)}
        >
          <span
            data-slot="slider-range"
            {...variantData(variants)}
            className={slotClass(slots, "range", variants)}
          />
        </span>
        <span data-part="thumb" aria-hidden="true" />
        {name && <input type="hidden" name={name} value={snapToStep(value, range)} disabled={disabled} />}
      </div>
    );
  },
);

Slider.displayName = "Slider";
