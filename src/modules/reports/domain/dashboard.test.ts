import { describe, expect, it } from "vitest";
import { sumTotals, type DaySummary } from "@/modules/daybook/domain";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { buildDashboard, dashboardFrom } from "./dashboard";

const day = (date: string, purchases: number, sales: number): DaySummary => ({
  date: date as DayKey,
  purchases: toman(purchases),
  sales: toman(sales),
  expenses: toman(0),
});

// Friday 3 Mehr 1405: week started Sat 28 Shahrivar, month started 1 Mehr (2026-09-23).
const today = "2026-09-25" as DayKey;

describe("dashboard", () => {
  it("loads from the earliest of last-7-days / week start / month start", () => {
    expect(dashboardFrom(today)).toBe("2026-09-19");
  });

  it("splits totals into today, this week and this month", () => {
    const recent = [day("2026-09-25", 35, 58), day("2026-09-22", 10, 12), day("2026-09-20", 5, 9)];
    const d = buildDashboard(today, recent, {
      ...sumTotals(recent),
      firstDay: "2026-09-20" as DayKey,
    });
    expect(d.todayDay?.sales).toBe(58);
    expect(d.thisWeek).toMatchObject({ sales: 79, days: 3 }); // 20, 22, 25 are all this week
    expect(d.thisMonth).toMatchObject({ sales: 58, days: 1 }); // 20 and 22 Sep are before 1 Mehr
    expect(d.week).toHaveLength(7);
    expect(d.week.at(-1)).toMatchObject({ date: today, profit: 23 });
  });

  it("has no today card until today is recorded", () => {
    const d = buildDashboard(today, [day("2026-09-24", 1, 2)], {
      ...sumTotals([]),
      firstDay: null,
    });
    expect(d.todayDay).toBeNull();
  });
});
