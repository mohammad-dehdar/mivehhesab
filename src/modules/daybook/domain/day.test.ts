import { describe, expect, it } from "vitest";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { profitOf, summarize, sumTotals, type DaySummary } from "./day";

const M = 1_000_000;
const day = (date: string, purchases: number, sales: number, expenses = 0): DaySummary => ({
  date: date as DayKey,
  purchases: toman(purchases),
  sales: toman(sales),
  expenses: toman(expenses),
});

describe("daybook totals", () => {
  // The seller's own example: 2M/4M then 4M/7M → 6M bought, 11M sold, 5M profit.
  const first = day("2026-09-24", 2 * M, 4 * M);
  const second = day("2026-09-25", 4 * M, 7 * M);

  it("computes a single day's profit", () => {
    expect(profitOf(first)).toBe(2 * M);
    expect(profitOf(second)).toBe(3 * M);
  });

  it("adds up all days", () => {
    expect(sumTotals([first, second])).toEqual({
      purchases: 6 * M,
      sales: 11 * M,
      expenses: 0,
      profit: 5 * M,
      days: 2,
    });
  });

  it("subtracts expenses and allows a loss", () => {
    expect(profitOf(day("2026-09-26", 5 * M, 5.5 * M, 800_000))).toBe(-300_000);
  });

  it("summarizes a day's itemized expenses", () => {
    const summary = summarize({
      date: "2026-09-25" as DayKey,
      purchases: toman(1000),
      sales: toman(3000),
      note: "",
      expenses: [
        { category: "کارگر", amount: toman(500) },
        { category: "حمل", amount: toman(200) },
      ],
    });
    expect(summary.expenses).toBe(700);
  });

  it("returns zeros for no days", () => {
    expect(sumTotals([])).toEqual({ purchases: 0, sales: 0, expenses: 0, profit: 0, days: 0 });
  });
});
