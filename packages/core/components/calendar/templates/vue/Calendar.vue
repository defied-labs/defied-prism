<script setup lang="ts">
import { computed, nextTick, normalizeClass, ref, useAttrs, useId, watch } from "vue";
import { useControllableState } from "@defied/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { IconButton } from "../icon-button";
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
} from "@defied/prism-core/components/calendar";

export interface CalendarProps {
  /** Selected date as "YYYY-MM-DD" (v-model); `null` = none. */
  modelValue?: string | null;
  /** Selected date (controlled); alias of `modelValue`. */
  value?: string | null;
  defaultValue?: string | null;
  /** Any date in the displayed month, "YYYY-MM-DD" (controlled, `v-model:month`). */
  month?: string;
  defaultMonth?: string;
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
  /** Edge the days float in from; month navigation slides them in from the side instead. */
  enterFrom?: "bottom" | "top" | "left" | "right";
  disabled?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: null,
  month: undefined,
  defaultMonth: undefined,
  min: undefined,
  max: undefined,
  isDateDisabled: undefined,
  locale: "en-US",
  weekStartsOn: 0,
  today: undefined,
  previousMonthLabel: "Previous month",
  nextMonthLabel: "Next month",
  size: "md",
  enterFrom: "bottom",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  "update:month": [month: string];
  monthChange: [month: string];
}>();

const attrs = useAttrs();
const headingId = useId();
const variants = () => ({ size: props.size, enterFrom: props.enterFrom });
const parse = (value: string | null | undefined) => (value ? parseISO(value) : null);

const valueISO = useControllableState<string | null>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue,
  onChange: (next) => {
    if (!next) return;
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});
const value = computed(() => parse(valueISO.value));
const now = computed(() => parse(props.today) ?? todayDate());
const constraints = computed(() => {
  const isDateDisabled = props.isDateDisabled;
  return {
    min: parse(props.min),
    max: parse(props.max),
    isDateDisabled: isDateDisabled && ((d: CalendarDate) => isDateDisabled(toISO(d))),
  };
});

const initial = clampDate(value.value ?? parse(props.defaultMonth) ?? now.value, constraints.value);
const monthISO = useControllableState<string>({
  value: () => props.month,
  defaultValue: toISO(startOfMonth(initial)),
  onChange: (next) => {
    emit("update:month", next);
    emit("monthChange", next);
  },
});
const month = computed(() => startOfMonth(parse(monthISO.value) ?? now.value));
const monthKey = computed(() => toISO(month.value));

// Which way the last month change went: later months float in from the
// right, earlier ones from the left; the first render uses `enterFrom`
const step = ref(0);
watch(monthKey, (next, prev) => {
  step.value = next > prev ? 1 : -1;
}, { flush: "sync" });
const bodyStyle = computed(() =>
  step.value ? { "--prism-float-x": `${step.value * 0.75}rem`, "--prism-float-y": "0" } : undefined,
);

// The roving tab stop: kept inside the displayed month
const focusedState = ref<CalendarDate>(initial);
const focused = computed(() => {
  const shown = month.value;
  if (isSameMonth(focusedState.value, shown)) return focusedState.value;
  const v = value.value;
  return clampDate(
    v && isSameMonth(v, shown) ? v : isSameMonth(now.value, shown) ? now.value : shown,
    constraints.value,
  );
});

const gridRef = ref<HTMLTableElement | null>(null);

function moveFocus(date: CalendarDate) {
  focusedState.value = date;
  if (!isSameMonth(date, month.value)) monthISO.value = toISO(startOfMonth(date));
  // Once the DOM shows the new tab stop
  void nextTick(() => gridRef.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus());
}

function onCellFocus(date: CalendarDate) {
  focusedState.value = date;
}

function select(date: CalendarDate) {
  if (props.disabled || isUnavailable(date, constraints.value)) return;
  focusedState.value = date;
  valueISO.value = toISO(date);
}

function goMonth(delta: number) {
  const current = focused.value;
  monthISO.value = toISO(addMonths(month.value, delta));
  focusedState.value = clampDate(addMonths(current, delta), constraints.value);
}

const weeks = computed(() => monthGrid(month.value, props.weekStartsOn));
const weekdays = computed(() => weekdayNames(props.locale, props.weekStartsOn));
const prevDisabled = computed(
  () => props.disabled || isMonthOutOfRange(addMonths(month.value, -1), constraints.value),
);
const nextDisabled = computed(
  () => props.disabled || isMonthOutOfRange(addMonths(month.value, 1), constraints.value),
);

function onGridKeyDown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select(focused.value);
    return;
  }
  const rtl = getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  const next = keyboardDate(event.key, focused.value, {
    ...constraints.value,
    weekStartsOn: props.weekStartsOn,
    shiftKey: event.shiftKey,
    rtl,
  });
  if (!next) return;
  event.preventDefault();
  moveFocus(next);
}

// Read in the render, so attribute changes re-render the root
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const labelledBy = attrs["aria-labelledby"] as string | undefined;
  return {
    ...rest,
    role: "group",
    "aria-labelledby": attrs["aria-label"] ? labelledBy : (labelledBy ?? headingId),
    "aria-disabled": props.disabled || undefined,
    "data-slot": "calendar",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

const cellAttrs = (date: CalendarDate) => ({
  role: "gridcell",
  tabindex: !props.disabled && isSameDay(date, focused.value) ? 0 : -1,
  "aria-label": formatFullDate(date, props.locale),
  "aria-selected": isSameDay(date, value.value) ? ("true" as const) : ("false" as const),
  "aria-current": isSameDay(date, now.value) ? ("date" as const) : undefined,
  "aria-disabled": props.disabled || isUnavailable(date, constraints.value) || undefined,
  "data-date": toISO(date),
  style: { "--prism-day-index": date.day - 1 },
  "data-slot": "calendar-cell",
  ...variantData(variants()),
  class: slotClass(slots, "cell", variants()),
});
</script>

<template>
  <div v-bind="rootAttrs()">
    <div data-slot="calendar-header" v-bind="variantData(variants())" :class="slotClass(slots, 'header', variants())">
      <IconButton
        variant="ghost"
        :size="size"
        :aria-label="previousMonthLabel"
        :disabled="prevDisabled"
        data-slot="calendar-nav-button"
        v-bind="variantData(variants())"
        :class="slotClass(slots, 'navButton', variants())"
        @click="goMonth(-1)"
      >
        ‹
      </IconButton>
      <h2
        :id="headingId"
        aria-live="polite"
        data-slot="calendar-heading"
        v-bind="variantData(variants())"
        :class="slotClass(slots, 'heading', variants())"
      >
        {{ formatMonthYear(month, locale) }}
      </h2>
      <IconButton
        variant="ghost"
        :size="size"
        :aria-label="nextMonthLabel"
        :disabled="nextDisabled"
        data-slot="calendar-nav-button"
        v-bind="variantData(variants())"
        :class="slotClass(slots, 'navButton', variants())"
        @click="goMonth(1)"
      >
        ›
      </IconButton>
    </div>
    <table
      ref="gridRef"
      role="grid"
      :aria-labelledby="headingId"
      data-slot="calendar-grid"
      v-bind="variantData(variants())"
      :class="slotClass(slots, 'grid', variants())"
      @keydown="onGridKeyDown"
    >
      <thead>
        <tr>
          <th
            v-for="w in weekdays"
            :key="w.long"
            scope="col"
            :abbr="w.long"
            data-slot="calendar-weekday"
            v-bind="variantData(variants())"
            :class="slotClass(slots, 'weekday', variants())"
          >{{ w.short }}</th>
        </tr>
      </thead>
      <tbody :key="monthKey" :style="bodyStyle">
        <tr v-for="week in weeks" :key="toISO(week[0]!)">
          <template v-for="date in week" :key="toISO(date)">
            <td v-if="!isSameMonth(date, month)" role="gridcell" />
            <td v-else v-bind="cellAttrs(date)" @focus="onCellFocus(date)" @click="select(date)"
              >{{ formatDay(date, locale) }}<span v-if="isSameDay(date, now)" data-part="today" aria-hidden="true" />
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
