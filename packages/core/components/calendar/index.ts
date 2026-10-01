/**
 * Framework-agnostic calendar date math, shared by every adapter.
 *
 * Dates are plain calendar dates ({ year, month 1-12, day }) or ISO
 * "YYYY-MM-DD" strings. Nothing here depends on the host time zone: day
 * arithmetic runs on an epoch-day count built from the fields, and local
 * `Date`s are only read field by field (`fromDate`), so DST transitions and
 * negative UTC offsets can never shift a day.
 */

export interface CalendarDate {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
}

/** 0 = Sunday … 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const MS_PER_DAY = 86_400_000;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Days since 1970-01-01 (proleptic Gregorian), independent of time zone. */
export function toEpochDay({ year, month, day }: CalendarDate): number {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  return Math.round(d.getTime() / MS_PER_DAY);
}

export function fromEpochDay(epochDay: number): CalendarDate {
  const d = new Date(epochDay * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** The local calendar date of a `Date` (what the user's wall clock shows). */
export function fromDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** A local `Date` at noon on the calendar date (noon avoids DST midnight gaps); for Intl formatting. */
export function toLocalDate({ year, month, day }: CalendarDate): Date {
  const d = new Date(2000, 0, 1, 12);
  d.setFullYear(year, month - 1, day);
  return d;
}

export function today(now: Date = new Date()): CalendarDate {
  return fromDate(now);
}

const pad = (n: number, width = 2) => String(Math.abs(n)).padStart(width, "0");

export function toISO({ year, month, day }: CalendarDate): string {
  const y = year < 0 ? `-${pad(year, 6)}` : year > 9999 ? `+${pad(year, 6)}` : pad(year, 4);
  return `${y}-${pad(month)}-${pad(day)}`;
}

/** Parses "YYYY-MM-DD"; null for malformed or impossible dates (2023-02-29). */
export function parseISO(value: string): CalendarDate | null {
  const match = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function compare(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function isSameDay(a: CalendarDate | null | undefined, b: CalendarDate | null | undefined): boolean {
  return !!a && !!b && compare(a, b) === 0;
}

export function isSameMonth(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromEpochDay(toEpochDay(date) + days);
}

/** Adds months, clamping the day to the target month (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const index = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

export function addYears(date: CalendarDate, years: number): CalendarDate {
  return addMonths(date, years * 12);
}

export function startOfMonth(date: CalendarDate): CalendarDate {
  return { year: date.year, month: date.month, day: 1 };
}

export function endOfMonth(date: CalendarDate): CalendarDate {
  return { year: date.year, month: date.month, day: daysInMonth(date.year, date.month) };
}

export function dayOfWeek(date: CalendarDate): Weekday {
  // 1970-01-01 was a Thursday (4)
  return ((((toEpochDay(date) + 4) % 7) + 7) % 7) as Weekday;
}

export function startOfWeek(date: CalendarDate, weekStartsOn: Weekday = 0): CalendarDate {
  return addDays(date, -((dayOfWeek(date) - weekStartsOn + 7) % 7));
}

export function endOfWeek(date: CalendarDate, weekStartsOn: Weekday = 0): CalendarDate {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

/**
 * The weeks shown for a month: rows of 7 dates from the week containing the
 * 1st to the week containing the last day (4-6 rows). Days outside the month
 * are included; use `isSameMonth` to tell them apart.
 */
export function monthGrid(month: CalendarDate, weekStartsOn: Weekday = 0): CalendarDate[][] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  const last = endOfWeek(endOfMonth(month), weekStartsOn);
  const count = toEpochDay(last) - toEpochDay(first) + 1;
  const weeks: CalendarDate[][] = [];
  for (let i = 0; i < count; i += 7) {
    weeks.push(Array.from({ length: 7 }, (_, d) => addDays(first, i + d)));
  }
  return weeks;
}

export interface DateConstraints {
  min?: CalendarDate | null;
  max?: CalendarDate | null;
  isDateDisabled?: (date: CalendarDate) => boolean;
}

export function isOutOfRange(date: CalendarDate, { min, max }: DateConstraints): boolean {
  return (!!min && compare(date, min) < 0) || (!!max && compare(date, max) > 0);
}

/** Out of range or disabled by the predicate: not selectable. */
export function isUnavailable(date: CalendarDate, constraints: DateConstraints): boolean {
  return isOutOfRange(date, constraints) || !!constraints.isDateDisabled?.(date);
}

export function clampDate(date: CalendarDate, { min, max }: DateConstraints): CalendarDate {
  if (min && compare(date, min) < 0) return min;
  if (max && compare(date, max) > 0) return max;
  return date;
}

/**
 * The date focus moves to for an APG date-grid key, or null if the key isn't
 * handled. Arrows move by days/weeks, Home/End to the start/end of the week,
 * PageUp/PageDown by months, Shift+PageUp/PageDown by years (day clamped to
 * the target month). The result is clamped to min/max; disabled dates stay
 * focusable (APG), only unselectable.
 */
export function keyboardDate(
  key: string,
  focused: CalendarDate,
  options: DateConstraints & { weekStartsOn?: Weekday; shiftKey?: boolean; rtl?: boolean } = {},
): CalendarDate | null {
  const { weekStartsOn = 0, shiftKey = false, rtl = false } = options;
  let next: CalendarDate;
  switch (key) {
    case "ArrowLeft":
      next = addDays(focused, rtl ? 1 : -1);
      break;
    case "ArrowRight":
      next = addDays(focused, rtl ? -1 : 1);
      break;
    case "ArrowUp":
      next = addDays(focused, -7);
      break;
    case "ArrowDown":
      next = addDays(focused, 7);
      break;
    case "Home":
      next = startOfWeek(focused, weekStartsOn);
      break;
    case "End":
      next = endOfWeek(focused, weekStartsOn);
      break;
    case "PageUp":
      next = shiftKey ? addYears(focused, -1) : addMonths(focused, -1);
      break;
    case "PageDown":
      next = shiftKey ? addYears(focused, 1) : addMonths(focused, 1);
      break;
    default:
      return null;
  }
  return clampDate(next, options);
}

/** Whether a whole month lies outside min/max (to disable month navigation). */
export function isMonthOutOfRange(month: CalendarDate, { min, max }: DateConstraints): boolean {
  return (!!min && compare(endOfMonth(month), min) < 0) || (!!max && compare(startOfMonth(month), max) > 0);
}

/** Weekday labels in display order, e.g. [{ short: "Sun", long: "Sunday" }, …]. */
export function weekdayNames(
  locale = "en-US",
  weekStartsOn: Weekday = 0,
  format: "narrow" | "short" = "short",
): { short: string; long: string }[] {
  const short = new Intl.DateTimeFormat(locale, { weekday: format });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long" });
  // 2023-01-01 was a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const date = toLocalDate({ year: 2023, month: 1, day: 1 + ((weekStartsOn + i) % 7) });
    return { short: short.format(date), long: long.format(date) };
  });
}

/** "January 2024" in the locale. */
export function formatMonthYear(month: CalendarDate, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(toLocalDate(month));
}

/** "Monday, January 1, 2024" in the locale (accessible day names). */
export function formatFullDate(date: CalendarDate, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(toLocalDate(date));
}

/** The day number in the locale's numbering system. */
export function formatDay(date: CalendarDate, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric" }).format(toLocalDate(date));
}
