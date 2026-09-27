"use client";

import { Loading } from "@/shared/components/loading";
import { useDaySummaries } from "../hooks";
import { DaysList } from "./days-list";

export function DaysScreen() {
  const days = useDaySummaries();
  return days.isPending ? (
    <Loading blocks={1} className="lg:grid-cols-1" />
  ) : (
    <DaysList days={days.data ?? []} />
  );
}
