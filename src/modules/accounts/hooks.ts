"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDb } from "@/platform/db";
import { toman } from "@/shared/lib/money";
import { accountsRepository } from "./data/repository";
import { withRunningBalance, type PartyKind } from "./domain/account";
import { entryInputSchema, partyInputSchema, type EntryInput, type PartyInput } from "./schemas";

export const accountsKeys = {
  all: ["accounts"] as const,
  list: (kind: PartyKind) => ["accounts", "list", kind] as const,
  totals: () => ["accounts", "totals"] as const,
  ledger: (id: number) => ["accounts", "ledger", id] as const,
};

function useRepository() {
  const db = useDb();
  return useMemo(() => accountsRepository(db), [db]);
}

export function useParties(kind: PartyKind) {
  const repo = useRepository();
  return useQuery({ queryKey: accountsKeys.list(kind), queryFn: () => repo.listParties(kind) });
}

export function useOutstandingTotals() {
  const repo = useRepository();
  return useQuery({ queryKey: accountsKeys.totals(), queryFn: () => repo.outstandingTotals() });
}

/** A person with their ledger (oldest first, with running balance), or null if not found. */
export function usePartyLedger(id: number) {
  const repo = useRepository();
  return useQuery({
    queryKey: accountsKeys.ledger(id),
    queryFn: async () => {
      const party = await repo.findParty(id);
      if (!party) return null;
      return { party, entries: withRunningBalance(await repo.listEntries(id)) };
    },
  });
}

/** Every write refreshes all account views (lists, totals, ledgers). */
function useAccountsMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => client.invalidateQueries({ queryKey: accountsKeys.all }),
  });
}

export function useCreateParty() {
  const repo = useRepository();
  return useAccountsMutation((input: PartyInput) =>
    repo.insertParty(partyInputSchema.parse(input)),
  );
}

export function useUpdateParty() {
  const repo = useRepository();
  return useAccountsMutation(({ id, input }: { id: number; input: PartyInput }) =>
    repo.updateParty({ id, ...partyInputSchema.parse(input) }),
  );
}

export function useDeleteParty() {
  const repo = useRepository();
  return useAccountsMutation((id: number) => repo.deleteParty(id));
}

export function useAddEntry() {
  const repo = useRepository();
  return useAccountsMutation((input: EntryInput) => {
    const e = entryInputSchema.parse(input);
    return repo.insertEntry({ ...e, amount: toman(e.amount) });
  });
}

export function useDeleteEntry() {
  const repo = useRepository();
  return useAccountsMutation((id: number) => repo.deleteEntry(id));
}
