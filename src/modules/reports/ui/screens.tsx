"use client";

import { useSearchParams } from "next/navigation";
import { BackupReminder } from "@/modules/settings";
import { Loading } from "@/shared/components/loading";
import type { PeriodKind } from "../domain/periods";
import { useDashboard, usePeriodReport } from "../hooks";
import { DashboardView } from "./dashboard-view";
import { PeriodReport } from "./period-report";

export function DashboardScreen() {
  const dashboard = useDashboard();
  return (
    <>
      <BackupReminder />
      {dashboard.data ? <DashboardView data={dashboard.data} /> : <Loading blocks={4} />}
    </>
  );
}

/** Weekly (default) or monthly (`?by=month`) report. */
export function ReportsScreen() {
  const kind: PeriodKind = useSearchParams().get("by") === "month" ? "month" : "week";
  const report = usePeriodReport(kind);
  return report.data ? (
    <PeriodReport kind={kind} periods={report.data} />
  ) : (
    <Loading blocks={2} className="lg:grid-cols-1" />
  );
}
