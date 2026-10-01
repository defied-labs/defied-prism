import { tailwindSlots } from "@defied-prism/core/tailwind";
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useControllableState } from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { IconButton } from "./IconButton";
import {
  addMonths,
  clampDate,
  formatDay,
  formatFullDate,
  formatMonthYear,
  isMonthOutOfRange,
  isSameDay,
  isSameMonth,
  isUnavailable,
  keyboardDate,
  monthGrid,
  parseISO,
  startOfMonth,
  toISO,
  today as todayDate,
  weekdayNames,
  type CalendarDate,
  type Weekday,
} from "@defied-prism/core/components/calendar";

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "role"> {
  /** Selected date as "YYYY-MM-DD" (controlled); `null` = none. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Any date in the displayed month, "YYYY-MM-DD" (controlled). */
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  /** Earliest selectable date, "YYYY-MM-DD". */
  min?: string;
  /** Latest selectable date, "YYYY-MM-DD". */
  max?: string;
  /** Dates that can be focused but not selected. */
  isDateDisabled?: (date: string) => boolean;
  /** BCP 47 locale for month and weekday names. */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn?: Weekday;
  /** Overrides today's date ("YYYY-MM-DD"), e.g. for tests or another time zone. */
  today?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "inline-flex flex-col gap-prism-2 font-prism-sans text-prism-fg aria-disabled:opacity-(--prism-opacity-disabled)",
    "variants": {}
  },
  "header": {
    "base": "flex items-center justify-between gap-prism-2",
    "variants": {}
  },
  "heading": {
    "base": "text-prism-sm font-prism-semibold leading-prism-tight",
    "variants": {}
  },
  "navButton": {
    "base": "shrink-0",
    "variants": {}
  },
  "grid": {
    "base": "[border-collapse:collapse]",
    "variants": {}
  },
  "weekday": {
    "base": "text-prism-xs font-prism-medium text-prism-muted-fg text-center",
    "variants": {}
  },
  "cell": {
    "base": "relative text-center rounded-prism-md cursor-pointer not-aria-disabled:hover:bg-prism-ghost-hover focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] aria-selected:bg-prism-primary aria-selected:text-prism-primary-fg aria-disabled:opacity-(--prism-opacity-disabled) aria-disabled:cursor-not-allowed aria-disabled:[text-decoration:line-through] [&_[data-part=today]]:absolute [&_[data-part=today]]:[inset-inline:0] [&_[data-part=today]]:[bottom:2px] [&_[data-part=today]]:[margin-inline:auto] [&_[data-part=today]]:[width:4px] [&_[data-part=today]]:[height:4px] [&_[data-part=today]]:rounded-prism-full [&_[data-part=today]]:[background:currentColor]",
    "variants": {
      "size": {
        "sm": "w-(--prism-control-sm) h-(--prism-control-sm) text-prism-xs",
        "md": "w-(--prism-control-md) h-(--prism-control-md) text-prism-sm"
      }
    }
  }
});

const parse = (value: string | null | undefined) => (value ? parseISO(value) : null);

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      min: minProp,
      max: maxProp,
      isDateDisabled,
      locale = "en-US",
      weekStartsOn = 0,
      today: todayProp,
      previousMonthLabel = "Previous month",
      nextMonthLabel = "Next month",
      size = "md",
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = { size };
    const headingId = useId();
    const [valueISO, setValueISO] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: (next) => {
        if (next) onValueChange?.(next);
      },
    });
    const value = parse(valueISO);
    const now = useMemo(() => parse(todayProp) ?? todayDate(), [todayProp]);
    const constraints = {
      min: parse(minProp),
      max: parse(maxProp),
      isDateDisabled: isDateDisabled && ((d: CalendarDate) => isDateDisabled(toISO(d))),
    };

    const initial = clampDate(value ?? parse(defaultMonth) ?? now, constraints);
    const [monthISO, setMonthISO] = useControllableState<string>({
      value: monthProp,
      defaultValue: toISO(startOfMonth(initial)),
      onChange: onMonthChange,
    });
    const month = startOfMonth(parse(monthISO) ?? now);

    // The roving tab stop: kept inside the displayed month
    const [focusedState, setFocused] = useState<CalendarDate>(initial);
    const focused = isSameMonth(focusedState, month)
      ? focusedState
      : clampDate(value && isSameMonth(value, month) ? value : isSameMonth(now, month) ? now : month, constraints);

    const shouldFocus = useRef(false);
    const gridRef = useRef<HTMLTableElement>(null);
    useEffect(() => {
      if (!shouldFocus.current) return;
      shouldFocus.current = false;
      gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    });

    const moveFocus = (date: CalendarDate) => {
      setFocused(date);
      if (!isSameMonth(date, month)) setMonthISO(toISO(startOfMonth(date)));
      shouldFocus.current = true;
    };

    const select = (date: CalendarDate) => {
      if (disabled || isUnavailable(date, constraints)) return;
      setFocused(date);
      setValueISO(toISO(date));
    };

    const goMonth = (delta: number) => {
      const next = addMonths(month, delta);
      setMonthISO(toISO(next));
      setFocused(clampDate(addMonths(focused, delta), constraints));
    };

    const weeks = monthGrid(month, weekStartsOn);
    const weekdays = weekdayNames(locale, weekStartsOn);
    const prevDisabled = disabled || isMonthOutOfRange(addMonths(month, -1), constraints);
    const nextDisabled = disabled || isMonthOutOfRange(addMonths(month, 1), constraints);

    const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(focused);
        return;
      }
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const next = keyboardDate(event.key, focused, { ...constraints, weekStartsOn, shiftKey: event.shiftKey, rtl });
      if (!next) return;
      event.preventDefault();
      moveFocus(next);
    };

    const navClass = slotClass(slots, "navButton", variants);

    return (
      <div
        {...props}
        ref={ref}
        role="group"
        aria-labelledby={props["aria-label"] ? props["aria-labelledby"] : (props["aria-labelledby"] ?? headingId)}
        aria-disabled={disabled || undefined}
        data-slot="calendar"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      >
        <div data-slot="calendar-header" {...variantData(variants)} className={slotClass(slots, "header", variants)}>
          <IconButton
            variant="ghost"
            size={size}
            aria-label={previousMonthLabel}
            disabled={prevDisabled}
            data-slot="calendar-nav-button"
            {...variantData(variants)}
            className={navClass}
            onClick={() => goMonth(-1)}
          >
            ‹
          </IconButton>
          <h2
            id={headingId}
            aria-live="polite"
            data-slot="calendar-heading"
            {...variantData(variants)}
            className={slotClass(slots, "heading", variants)}
          >
            {formatMonthYear(month, locale)}
          </h2>
          <IconButton
            variant="ghost"
            size={size}
            aria-label={nextMonthLabel}
            disabled={nextDisabled}
            data-slot="calendar-nav-button"
            {...variantData(variants)}
            className={navClass}
            onClick={() => goMonth(1)}
          >
            ›
          </IconButton>
        </div>
        <table
          ref={gridRef}
          role="grid"
          aria-labelledby={headingId}
          data-slot="calendar-grid"
          {...variantData(variants)}
          className={slotClass(slots, "grid", variants)}
          onKeyDown={onGridKeyDown}
        >
          <thead>
            <tr>
              {weekdays.map((w) => (
                <th
                  key={w.long}
                  scope="col"
                  abbr={w.long}
                  data-slot="calendar-weekday"
                  {...variantData(variants)}
                  className={slotClass(slots, "weekday", variants)}
                >
                  {w.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toISO(week[0]!)}>
                {week.map((date) => {
                  const iso = toISO(date);
                  if (!isSameMonth(date, month)) return <td key={iso} role="gridcell" />;
                  const isToday = isSameDay(date, now);
                  const unavailable = isUnavailable(date, constraints);
                  return (
                    <td
                      key={iso}
                      role="gridcell"
                      tabIndex={!disabled && isSameDay(date, focused) ? 0 : -1}
                      aria-label={formatFullDate(date, locale)}
                      aria-selected={isSameDay(date, value)}
                      aria-current={isToday ? "date" : undefined}
                      aria-disabled={disabled || unavailable || undefined}
                      data-date={iso}
                      data-slot="calendar-cell"
                      {...variantData(variants)}
                      className={slotClass(slots, "cell", variants)}
                      onFocus={() => setFocused(date)}
                      onClick={() => select(date)}
                    >
                      {formatDay(date, locale)}
                      {isToday && <span data-part="today" aria-hidden="true" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
