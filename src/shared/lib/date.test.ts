import { describe, expect, it } from "vitest";
import {
  formatJalali,
  isDayKey,
  monthStartKey,
  shiftDay,
  toDayKey,
  weekStartKey,
  type DayKey,
} from "./date";

const key = (s: string) => s as DayKey;

describe("day keys", () => {
  it("round-trips local dates", () => {
    expect(toDayKey(new Date(2026, 8, 25))).toBe("2026-09-25");
  });

  it("validates", () => {
    expect(isDayKey("2026-09-25")).toBe(true);
    expect(isDayKey("2026-02-30")).toBe(false);
    expect(isDayKey("25/09/2026")).toBe(false);
  });

  it("shifts across month ends", () => {
    expect(shiftDay(key("2026-09-30"), 1)).toBe("2026-10-01");
    expect(shiftDay(key("2026-10-01"), -1)).toBe("2026-09-30");
  });
});

describe("jalali periods", () => {
  it("weeks start on Saturday", () => {
    // Friday 3 Mehr 1405 → Saturday 28 Shahrivar 1405
    expect(weekStartKey(key("2026-09-25"))).toBe("2026-09-19");
    expect(weekStartKey(key("2026-09-19"))).toBe("2026-09-19");
  });

  it("months follow the Jalali calendar", () => {
    // 3 Mehr 1405 → 1 Mehr 1405
    expect(monthStartKey(key("2026-09-25"))).toBe("2026-09-23");
  });

  it("formats day keys in Jalali with Persian digits", () => {
    expect(formatJalali("2026-09-25")).toBe("۱۴۰۵/۰۷/۰۳");
  });
});
