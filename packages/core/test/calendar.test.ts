import { afterAll, describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compare,
  dayOfWeek,
  daysInMonth,
  endOfWeek,
  formatDay,
  formatFullDate,
  formatMonthYear,
  fromDate,
  fromEpochDay,
  isLeapYear,
  isMonthOutOfRange,
  isOutOfRange,
  isSameDay,
  isSameMonth,
  isUnavailable,
  keyboardDate,
  monthGrid,
  parseISO,
  startOfWeek,
  toEpochDay,
  toISO,
  toLocalDate,
  weekdayNames,
  type CalendarDate,
} from "../components/calendar";

const d = (iso: string): CalendarDate => parseISO(iso)!;
const iso = toISO;

describe("calendar: parsing and formatting ISO", () => {
  it("round-trips", () => {
    expect(parseISO("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(toISO({ year: 5, month: 1, day: 9 })).toBe("0005-01-09");
    expect(iso(d("1999-12-31"))).toBe("1999-12-31");
  });

  it("rejects malformed and impossible dates", () => {
    expect(parseISO("2023-02-29")).toBeNull();
    expect(parseISO("2024-13-01")).toBeNull();
    expect(parseISO("2024-04-31")).toBeNull();
    expect(parseISO("2024-00-10")).toBeNull();
    expect(parseISO("2024-1-1")).toBeNull();
    expect(parseISO("2024-01-01T00:00")).toBeNull();
  });
});

describe("calendar: leap years and month lengths", () => {
  it("knows leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
  });

  it("knows month lengths", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => daysInMonth(2023, m))).toEqual([
      31, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ]);
  });
});

describe("calendar: arithmetic", () => {
  it("adds days across month and year boundaries", () => {
    expect(iso(addDays(d("2024-01-31"), 1))).toBe("2024-02-01");
    expect(iso(addDays(d("2024-02-28"), 1))).toBe("2024-02-29");
    expect(iso(addDays(d("2023-02-28"), 1))).toBe("2023-03-01");
    expect(iso(addDays(d("2023-12-31"), 1))).toBe("2024-01-01");
    expect(iso(addDays(d("2024-01-01"), -1))).toBe("2023-12-31");
    expect(iso(addDays(d("2024-03-01"), -1))).toBe("2024-02-29");
    expect(iso(addDays(d("2024-01-01"), 366))).toBe("2025-01-01");
  });

  it("epoch days are exact", () => {
    expect(toEpochDay(d("1970-01-01"))).toBe(0);
    expect(toEpochDay(d("1969-12-31"))).toBe(-1);
    expect(toEpochDay(d("2000-03-01")) - toEpochDay(d("2000-02-28"))).toBe(2);
    expect(iso(fromEpochDay(toEpochDay(d("0050-06-15"))))).toBe("0050-06-15");
  });

  it("adds months, clamping the day", () => {
    expect(iso(addMonths(d("2024-01-31"), 1))).toBe("2024-02-29");
    expect(iso(addMonths(d("2023-01-31"), 1))).toBe("2023-02-28");
    expect(iso(addMonths(d("2024-03-31"), -1))).toBe("2024-02-29");
    expect(iso(addMonths(d("2024-05-31"), 1))).toBe("2024-06-30");
    expect(iso(addMonths(d("2024-12-15"), 1))).toBe("2025-01-15");
    expect(iso(addMonths(d("2024-01-15"), -1))).toBe("2023-12-15");
    expect(iso(addMonths(d("2024-01-15"), -13))).toBe("2022-12-15");
    expect(iso(addMonths(d("2024-01-15"), 25))).toBe("2026-02-15");
  });

  it("adds years, clamping Feb 29", () => {
    expect(iso(addYears(d("2024-02-29"), 1))).toBe("2025-02-28");
    expect(iso(addYears(d("2024-02-29"), 4))).toBe("2028-02-29");
    expect(iso(addYears(d("2024-02-29"), -1))).toBe("2023-02-28");
  });

  it("compares", () => {
    expect(compare(d("2024-01-02"), d("2024-01-01"))).toBeGreaterThan(0);
    expect(compare(d("2023-12-31"), d("2024-01-01"))).toBeLessThan(0);
    expect(isSameDay(d("2024-01-01"), d("2024-01-01"))).toBe(true);
    expect(isSameDay(null, d("2024-01-01"))).toBe(false);
    expect(isSameMonth(d("2024-01-01"), d("2024-01-31"))).toBe(true);
    expect(isSameMonth(d("2024-01-01"), d("2023-01-01"))).toBe(false);
  });
});

describe("calendar: weeks", () => {
  it("computes the weekday", () => {
    expect(dayOfWeek(d("1970-01-01"))).toBe(4);
    expect(dayOfWeek(d("2024-01-01"))).toBe(1);
    expect(dayOfWeek(d("2000-02-29"))).toBe(2);
    expect(dayOfWeek(d("1969-12-28"))).toBe(0);
  });

  it("finds week bounds for any week start", () => {
    // 2024-01-03 is a Wednesday
    expect(iso(startOfWeek(d("2024-01-03")))).toBe("2023-12-31");
    expect(iso(startOfWeek(d("2024-01-03"), 1))).toBe("2024-01-01");
    expect(iso(startOfWeek(d("2024-01-03"), 6))).toBe("2023-12-30");
    expect(iso(endOfWeek(d("2024-01-03")))).toBe("2024-01-06");
    expect(iso(endOfWeek(d("2024-01-03"), 1))).toBe("2024-01-07");
    // A date that is itself the week start
    expect(iso(startOfWeek(d("2024-01-01"), 1))).toBe("2024-01-01");
  });

  it("builds month grids", () => {
    const jan = monthGrid(d("2024-01-15"));
    expect(jan).toHaveLength(5);
    expect(iso(jan[0]![0]!)).toBe("2023-12-31");
    expect(iso(jan[4]![6]!)).toBe("2024-02-03");
    for (const week of jan) expect(week).toHaveLength(7);

    // Monday start
    const janMon = monthGrid(d("2024-01-15"), 1);
    expect(iso(janMon[0]![0]!)).toBe("2024-01-01");
    expect(janMon).toHaveLength(5);

    // Feb 2015 starts on Sunday and has 28 days: exactly 4 rows
    expect(monthGrid(d("2015-02-01"))).toHaveLength(4);
    // Leap Feb 2024 includes the 29th
    const feb = monthGrid(d("2024-02-01")).flat().filter((x) => x.month === 2);
    expect(feb).toHaveLength(29);
    // Six rows: Sep 2024 with a Monday start begins on Sunday the 1st
    expect(monthGrid(d("2024-09-01"), 1)).toHaveLength(6);
  });

  it("grid days are consecutive", () => {
    const days = monthGrid(d("2024-03-01"), 1).flat();
    for (let i = 1; i < days.length; i++) {
      expect(toEpochDay(days[i]!) - toEpochDay(days[i - 1]!)).toBe(1);
    }
  });
});

describe("calendar: constraints", () => {
  const min = d("2024-01-10");
  const max = d("2024-02-20");

  it("checks range and disabled dates", () => {
    expect(isOutOfRange(d("2024-01-09"), { min, max })).toBe(true);
    expect(isOutOfRange(d("2024-01-10"), { min, max })).toBe(false);
    expect(isOutOfRange(d("2024-02-21"), { min, max })).toBe(true);
    const weekends = (x: CalendarDate) => dayOfWeek(x) === 0 || dayOfWeek(x) === 6;
    expect(isUnavailable(d("2024-01-13"), { isDateDisabled: weekends })).toBe(true);
    expect(isUnavailable(d("2024-01-12"), { isDateDisabled: weekends })).toBe(false);
  });

  it("clamps", () => {
    expect(iso(clampDate(d("2024-01-01"), { min, max }))).toBe("2024-01-10");
    expect(iso(clampDate(d("2024-03-01"), { min, max }))).toBe("2024-02-20");
    expect(iso(clampDate(d("2024-01-15"), {}))).toBe("2024-01-15");
  });

  it("knows months outside the range", () => {
    expect(isMonthOutOfRange(d("2023-12-01"), { min, max })).toBe(true);
    expect(isMonthOutOfRange(d("2024-01-01"), { min, max })).toBe(false);
    expect(isMonthOutOfRange(d("2024-02-01"), { min, max })).toBe(false);
    expect(isMonthOutOfRange(d("2024-03-01"), { min, max })).toBe(true);
  });
});

describe("calendar: keyboard", () => {
  const f = d("2024-01-31"); // Wednesday
  const key = (k: string, opts = {}) => {
    const r = keyboardDate(k, f, opts);
    return r && iso(r);
  };

  it("moves by days and weeks", () => {
    expect(key("ArrowRight")).toBe("2024-02-01");
    expect(key("ArrowLeft")).toBe("2024-01-30");
    expect(key("ArrowDown")).toBe("2024-02-07");
    expect(key("ArrowUp")).toBe("2024-01-24");
    expect(key("ArrowRight", { rtl: true })).toBe("2024-01-30");
  });

  it("moves to week bounds", () => {
    expect(key("Home")).toBe("2024-01-28");
    expect(key("End")).toBe("2024-02-03");
    expect(key("Home", { weekStartsOn: 1 })).toBe("2024-01-29");
    expect(key("End", { weekStartsOn: 1 })).toBe("2024-02-04");
  });

  it("moves by months and years, clamping the day", () => {
    expect(key("PageDown")).toBe("2024-02-29");
    expect(key("PageUp")).toBe("2023-12-31");
    expect(key("PageDown", { shiftKey: true })).toBe("2025-01-31");
    expect(key("PageUp", { shiftKey: true })).toBe("2023-01-31");
    expect(iso(keyboardDate("PageDown", d("2024-02-29"), { shiftKey: true })!)).toBe("2025-02-28");
  });

  it("clamps to min/max and ignores other keys", () => {
    expect(key("PageDown", { max: d("2024-02-10") })).toBe("2024-02-10");
    expect(key("ArrowUp", { min: d("2024-01-30") })).toBe("2024-01-30");
    expect(key("a")).toBeNull();
    expect(key("Enter")).toBeNull();
  });
});

describe("calendar: locale labels", () => {
  it("names weekdays in order for the week start", () => {
    expect(weekdayNames().map((w) => w.long)).toEqual([
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ]);
    expect(weekdayNames("en-US", 1)[0]).toEqual({ short: "Mon", long: "Monday" });
    expect(weekdayNames("en-US", 6, "narrow")[0]!.short).toBe("S");
    expect(weekdayNames("fr-FR", 1)[0]!.long).toBe("lundi");
  });

  it("formats months and full dates", () => {
    expect(formatMonthYear(d("2024-01-01"))).toBe("January 2024");
    expect(formatMonthYear(d("2024-03-01"), "de-DE")).toBe("März 2024");
    expect(formatFullDate(d("2024-02-29"))).toBe("Thursday, February 29, 2024");
    expect(formatDay(d("2024-02-09"))).toBe("9");
  });
});

describe("calendar: time-zone safety", () => {
  const original = process.env.TZ;
  afterAll(() => {
    process.env.TZ = original;
  });

  it.each(["America/New_York", "America/Sao_Paulo", "Pacific/Kiritimati", "Pacific/Pago_Pago", "Europe/London"])(
    "local dates never shift in %s, including DST days",
    (tz) => {
      process.env.TZ = tz;
      // US and EU DST transitions, and a southern-hemisphere one
      for (const s of ["2024-03-10", "2024-11-03", "2024-03-31", "2024-10-27", "2018-11-04", "2024-01-01", "2024-12-31"]) {
        const date = d(s);
        expect(iso(fromDate(toLocalDate(date))), s).toBe(s);
        expect(iso(addDays(addDays(date, 1), -1))).toBe(s);
        expect(formatFullDate(date)).toContain(String(date.day));
      }
      // Local midnight on a DST day still reads as that calendar day
      expect(iso(fromDate(new Date(2024, 2, 10, 0, 0)))).toBe("2024-03-10");
      expect(iso(fromDate(new Date(2024, 10, 3, 23, 59)))).toBe("2024-11-03");
      // Consecutive days across DST are exactly one epoch day apart
      expect(toEpochDay(d("2024-03-11")) - toEpochDay(d("2024-03-10"))).toBe(1);
      expect(iso(addDays(d("2024-03-09"), 2))).toBe("2024-03-11");
    },
  );
});
