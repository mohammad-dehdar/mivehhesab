"use client";

import { useAllTimeTotals, useDaySummaries } from "@/modules/daybook";
import { todayKey } from "@/shared/lib/date";
import { buildDashboard, dashboardFrom, type Dashboard } from "./domain/dashboard";
import { groupByPeriod, type PeriodKind, type PeriodTotals } from "./domain/periods";

type Loadable<T> = { data: T | undefined; isPending: boolean };

export function useDashboard(): Loadable<Dashboard> {
  const today = todayKey();
  const recent = useDaySummaries({ from: dashboardFrom(today), to: today });
  const allTime = useAllTimeTotals();
  return {
    isPending: recent.isPending || allTime.isPending,
    data:
      recent.data && allTime.data ? buildDashboard(today, recent.data, allTime.data) : undefined,
  };
}

/** Every recorded week or month, newest first. */
export function usePeriodReport(kind: PeriodKind): Loadable<PeriodTotals[]> {
  const days = useDaySummaries();
  return { isPending: days.isPending, data: days.data && groupByPeriod(days.data, kind) };
}
