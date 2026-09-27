import { sumTotals, type DaySummary, type Totals } from "@/modules/daybook/domain";
import { monthStartKey, shiftDay, weekStartKey, type DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";

export type PeriodKind = "week" | "month";

export type PeriodTotals = { start: DayKey; totals: Totals };

const startOf: Record<PeriodKind, (key: DayKey) => DayKey> = {
  week: weekStartKey,
  month: monthStartKey,
};

/** Groups day summaries into Jalali weeks or months, newest period first. */
export function groupByPeriod(days: readonly DaySummary[], kind: PeriodKind): PeriodTotals[] {
  const groups = new Map<DayKey, DaySummary[]>();
  for (const day of days) {
    const start = startOf[kind](day.date);
    groups.set(start, [...(groups.get(start) ?? []), day]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([start, group]) => ({ start, totals: sumTotals(group) }));
}

/**
 * The `count` days ending at `end` (oldest first), with zero totals for days
 * nothing was recorded — so a chart always shows a continuous week.
 */
export function lastDays(days: readonly DaySummary[], end: DayKey, count: number): DaySummary[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  return Array.from({ length: count }, (_, i) => {
    const date = shiftDay(end, i - count + 1);
    return byDate.get(date) ?? { date, purchases: toman(0), sales: toman(0), expenses: toman(0) };
  });
}
