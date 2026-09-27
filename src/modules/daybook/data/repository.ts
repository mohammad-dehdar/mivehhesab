import type { Db } from "@/platform/db";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import type { Day, DaySummary, Totals } from "../domain/day";
import { profitOf } from "../domain/day";

type DayRow = { date: string; purchases: number; sales: number; note: string };
type ExpenseRow = { category: string; amount: number };
type SummaryRow = { date: string; purchases: number; sales: number; expenses: number };

const toSummary = (r: SummaryRow): DaySummary => ({
  date: r.date as DayKey,
  purchases: toman(r.purchases),
  sales: toman(r.sales),
  expenses: toman(r.expenses),
});

const SUMMARY_SELECT = `
  SELECT d.date, d.purchases, d.sales,
         COALESCE((SELECT SUM(e.amount) FROM day_expenses e WHERE e.date = d.date), 0) AS expenses
  FROM days d`;

export type AllTimeTotals = Totals & { firstDay: DayKey | null };

/** All daybook reads and writes, against any `Db` (browser worker or test SQLite). */
export function daybookRepository(db: Db) {
  return {
    async findDay(date: DayKey): Promise<Day | null> {
      const [row] = await db.query<DayRow>(
        "SELECT date, purchases, sales, note FROM days WHERE date = ?",
        [date],
      );
      if (!row) return null;
      const expenses = await db.query<ExpenseRow>(
        "SELECT category, amount FROM day_expenses WHERE date = ? ORDER BY id",
        [date],
      );
      return {
        date: row.date as DayKey,
        purchases: toman(row.purchases),
        sales: toman(row.sales),
        note: row.note,
        expenses: expenses.map((e) => ({ category: e.category, amount: toman(e.amount) })),
      };
    },

    /** Day summaries in [from, to] (inclusive), newest first. Omit bounds for all days. */
    async listSummaries({ from, to }: { from?: DayKey; to?: DayKey } = {}): Promise<DaySummary[]> {
      const rows = await db.query<SummaryRow>(
        `${SUMMARY_SELECT}
         WHERE d.date >= COALESCE(?, '0000-00-00') AND d.date <= COALESCE(?, '9999-99-99')
         ORDER BY d.date DESC`,
        [from ?? null, to ?? null],
      );
      return rows.map(toSummary);
    },

    /** Totals over every recorded day, computed in SQL. */
    async allTimeTotals(): Promise<AllTimeTotals> {
      const [row] = await db.query<SummaryRow & { days: number; firstDay: string | null }>(
        `SELECT COALESCE(SUM(purchases), 0) AS purchases,
                COALESCE(SUM(sales), 0)     AS sales,
                (SELECT COALESCE(SUM(amount), 0) FROM day_expenses) AS expenses,
                COUNT(*)  AS days,
                MIN(date) AS firstDay
         FROM days`,
      );
      const totals = {
        purchases: toman(row.purchases),
        sales: toman(row.sales),
        expenses: toman(row.expenses),
      };
      return {
        ...totals,
        profit: profitOf(totals),
        days: row.days,
        firstDay: row.firstDay as DayKey | null,
      };
    },

    /** Creates or replaces a day together with its expense lines, atomically. */
    async saveDay(day: Day): Promise<void> {
      await db.batch([
        {
          sql: `INSERT INTO days (date, purchases, sales, note, updated_at) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(date) DO UPDATE SET
                  purchases = excluded.purchases, sales = excluded.sales,
                  note = excluded.note, updated_at = excluded.updated_at`,
          params: [day.date, day.purchases, day.sales, day.note, new Date().toISOString()],
        },
        { sql: "DELETE FROM day_expenses WHERE date = ?", params: [day.date] },
        ...day.expenses.map((e) => ({
          sql: "INSERT INTO day_expenses (date, category, amount) VALUES (?, ?, ?)",
          params: [day.date, e.category, e.amount],
        })),
      ]);
    },

    async deleteDay(date: DayKey): Promise<void> {
      await db.run("DELETE FROM days WHERE date = ?", [date]);
    },
  };
}

export type DaybookRepository = ReturnType<typeof daybookRepository>;
