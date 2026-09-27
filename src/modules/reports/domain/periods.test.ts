import { describe, expect, it } from "vitest";
import type { DaySummary } from "@/modules/daybook/domain";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { groupByPeriod, lastDays } from "./periods";

const day = (date: string, purchases: number, sales: number, expenses = 0): DaySummary => ({
  date: date as DayKey,
  purchases: toman(purchases),
  sales: toman(sales),
  expenses: toman(expenses),
});

// Thu 2 Mehr, Fri 3 Mehr (week starting Sat 28 Shahrivar) and Sat 4 Mehr (next week)
const days = [
  day("2026-09-26", 1000, 1500),
  day("2026-09-25", 4000, 7000),
  day("2026-09-24", 2000, 4000, 500),
];

describe("groupByPeriod", () => {
  it("groups by Jalali week (Saturday start), newest first", () => {
    const weeks = groupByPeriod(days, "week");
    expect(weeks.map((w) => w.start)).toEqual(["2026-09-26", "2026-09-19"]);
    expect(weeks[1].totals).toMatchObject({
      purchases: 6000,
      sales: 11000,
      expenses: 500,
      profit: 4500,
      days: 2,
    });
  });

  it("groups by Jalali month", () => {
    const withShahrivar = [...days, day("2026-09-20", 100, 300)];
    const months = groupByPeriod(withShahrivar, "month");
    expect(months.map((m) => m.start)).toEqual(["2026-09-23", "2026-08-23"]);
    expect(months[0].totals.days).toBe(3);
  });
});

describe("lastDays", () => {
  it("fills unrecorded days with zeros, oldest first", () => {
    const week = lastDays(days, "2026-09-26" as DayKey, 4);
    expect(week.map((d) => d.date)).toEqual([
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
    ]);
    expect(week[0].sales).toBe(0);
    expect(week[3].sales).toBe(1500);
  });
});
