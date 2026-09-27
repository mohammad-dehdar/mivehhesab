import { profitOf, sumTotals, type DaySummary, type Totals } from "@/modules/daybook/domain";
import { monthStartKey, shiftDay, weekStartKey, type DayKey } from "@/shared/lib/date";
import { lastDays } from "./periods";

export type Dashboard = {
  today: DayKey;
  /** null until today's totals are entered */
  todayDay: DaySummary | null;
  allTime: Totals & { firstDay: DayKey | null };
  thisWeek: Totals;
  thisMonth: Totals;
  /** last 7 days, oldest first, with profit per day */
  week: (DaySummary & { profit: number })[];
};

/** Earliest day the dashboard needs: covers the last 7 days, this week and this month. */
export const dashboardFrom = (today: DayKey): DayKey =>
  [shiftDay(today, -6), weekStartKey(today), monthStartKey(today)].sort()[0] as DayKey;

export function buildDashboard(
  today: DayKey,
  recent: readonly DaySummary[],
  allTime: Dashboard["allTime"],
): Dashboard {
  const since = (start: DayKey) => sumTotals(recent.filter((d) => d.date >= start));
  return {
    today,
    todayDay: recent.find((d) => d.date === today) ?? null,
    allTime,
    thisWeek: since(weekStartKey(today)),
    thisMonth: since(monthStartKey(today)),
    week: lastDays(recent, today, 7).map((d) => ({ ...d, profit: profitOf(d) })),
  };
}
