import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDateRange,
  formatDayDate,
  isISODate,
  monthOfISODate,
  toICSDate,
} from "./dates";

describe("isISODate", () => {
  it("accepts real calendar dates", () => {
    expect(isISODate("2026-05-04")).toBe(true);
    expect(isISODate("2024-02-29")).toBe(true); // leap year
  });

  it("rejects malformed and impossible dates", () => {
    expect(isISODate("")).toBe(false);
    expect(isISODate(null)).toBe(false);
    expect(isISODate("next tuesday")).toBe(false);
    expect(isISODate("2026-5-4")).toBe(false);
    expect(isISODate("2026-13-01")).toBe(false);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("2025-02-29")).toBe(false); // not a leap year
  });
});

describe("monthOfISODate", () => {
  it("returns a 0-11 index", () => {
    expect(monthOfISODate("2026-01-15")).toBe(0);
    expect(monthOfISODate("2026-12-31")).toBe(11);
  });

  it("returns null for a non-date", () => {
    expect(monthOfISODate("whenever")).toBeNull();
  });
});

describe("addDays", () => {
  it("moves forward and backward", () => {
    expect(addDays("2026-05-04", 3)).toBe("2026-05-07");
    expect(addDays("2026-05-04", -4)).toBe("2026-04-30");
    expect(addDays("2026-05-04", 0)).toBe("2026-05-04");
  });

  it("crosses month, year, and leap-day boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2025-02-28", 1)).toBe("2025-03-01");
  });

  // A local-time implementation would drift an hour here and land a day early.
  it("is timezone-stable across a DST change", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
  });
});

describe("formatDayDate", () => {
  it("reads as a weekday and date", () => {
    expect(formatDayDate("2026-05-04")).toBe("Mon 4 May");
    expect(formatDayDate("2026-01-01")).toBe("Thu 1 Jan");
  });
});

describe("formatDateRange", () => {
  it("collapses a shared month and year", () => {
    expect(formatDateRange("2026-05-04", "2026-05-12")).toBe("4 – 12 May 2026");
  });

  it("keeps both months when they differ", () => {
    expect(formatDateRange("2026-04-28", "2026-05-03")).toBe("28 Apr – 3 May 2026");
  });

  it("keeps both years across new year", () => {
    expect(formatDateRange("2026-12-28", "2027-01-03")).toBe(
      "28 Dec 2026 – 3 Jan 2027",
    );
  });
});

describe("toICSDate", () => {
  it("strips the dashes", () => {
    expect(toICSDate("2026-05-04")).toBe("20260504");
  });
});
