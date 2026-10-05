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
} from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import {
  clamp,
  fractionToValue,
  keyboardValue,
  pointerFraction,
  snapToStep,
  valueToPercent,
} from "@defied-labs/prism-core/components/slider";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

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
