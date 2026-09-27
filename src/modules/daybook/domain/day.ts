import type { DayKey } from "@/shared/lib/date";
import { sumToman, toman, type Toman } from "@/shared/lib/money";

export type Expense = { category: string; amount: Toman };

/** One day as entered by the seller: totals only, no per-customer detail. */
export type Day = {
  date: DayKey;
  purchases: Toman;
  sales: Toman;
  expenses: Expense[];
  note: string;
};

/** A day reduced to its three totals — what reports work with. */
export type DaySummary = {
  date: DayKey;
  purchases: Toman;
  sales: Toman;
  expenses: Toman;
};

export type Totals = {
  purchases: Toman;
  sales: Toman;
  expenses: Toman;
  /** sales − purchases − expenses; negative means a loss. */
  profit: Toman;
  /** Number of recorded days included. */
  days: number;
};

export const expensesTotal = (expenses: readonly Expense[]): Toman =>
  sumToman(expenses.map((e) => e.amount));

export const profitOf = (d: Pick<DaySummary, "purchases" | "sales" | "expenses">): Toman =>
  toman(d.sales - d.purchases - d.expenses);

export const summarize = (day: Day): DaySummary => ({
  date: day.date,
  purchases: day.purchases,
  sales: day.sales,
  expenses: expensesTotal(day.expenses),
});

export function sumTotals(days: readonly DaySummary[]): Totals {
  const purchases = sumToman(days.map((d) => d.purchases));
  const sales = sumToman(days.map((d) => d.sales));
  const expenses = sumToman(days.map((d) => d.expenses));
  return {
    purchases,
    sales,
    expenses,
    profit: profitOf({ purchases, sales, expenses }),
    days: days.length,
  };
}

export const EMPTY_TOTALS: Totals = sumTotals([]);
