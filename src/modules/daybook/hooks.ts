"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDb } from "@/platform/db";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { daybookRepository } from "./data/repository";
import { dayInputSchema, dayKeySchema, type DayInput } from "./schemas";

export const daybookKeys = {
  all: ["daybook"] as const,
  day: (date: DayKey) => ["daybook", "day", date] as const,
  summaries: (range: { from?: DayKey; to?: DayKey }) => ["daybook", "summaries", range] as const,
  allTime: () => ["daybook", "all-time"] as const,
};

function useRepository() {
  const db = useDb();
  return useMemo(() => daybookRepository(db), [db]);
}

export function useDay(date: DayKey) {
  const repo = useRepository();
  return useQuery({ queryKey: daybookKeys.day(date), queryFn: () => repo.findDay(date) });
}

export function useDaySummaries(range: { from?: DayKey; to?: DayKey } = {}) {
  const repo = useRepository();
  return useQuery({
    queryKey: daybookKeys.summaries(range),
    queryFn: () => repo.listSummaries(range),
  });
}

export function useAllTimeTotals() {
  const repo = useRepository();
  return useQuery({ queryKey: daybookKeys.allTime(), queryFn: () => repo.allTimeTotals() });
}

/** Any change to days affects every total and report, so refresh them all. */
function useInvalidateAll() {
  const client = useQueryClient();
  return () => client.invalidateQueries();
}

export function useSaveDay() {
  const repo = useRepository();
  const onSuccess = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: DayInput) => {
      const { date, purchases, sales, note, expenses } = dayInputSchema.parse(input);
      await repo.saveDay({
        date,
        purchases: toman(purchases),
        sales: toman(sales),
        note,
        expenses: expenses.map((e) => ({ category: e.category, amount: toman(e.amount) })),
      });
    },
    onSuccess,
  });
}

export function useDeleteDay() {
  const repo = useRepository();
  const onSuccess = useInvalidateAll();
  return useMutation({
    mutationFn: (date: DayKey) => repo.deleteDay(dayKeySchema.parse(date)),
    onSuccess,
  });
}
