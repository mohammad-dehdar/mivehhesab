import type { DayKey } from "@/shared/lib/date";
import { sumToman, toman, type Toman } from "@/shared/lib/money";

/** customer: buys on credit from the shop · supplier: sells stock to the shop on credit */
export type PartyKind = "customer" | "supplier";

/** debt: the balance grows (credit given/taken) · payment: the balance shrinks */
export type EntryType = "debt" | "payment";

export type Party = {
  id: number;
  name: string;
  phone: string;
  kind: PartyKind;
  note: string;
};

export type PartyWithBalance = Party & {
  /**
   * Outstanding amount. For a customer it's what they owe the shop; for a
   * supplier it's what the shop owes them. Negative means overpaid.
   */
  balance: Toman;
  lastEntryDate: DayKey | null;
};

export type Entry = {
  id: number;
  partyId: number;
  date: DayKey;
  type: EntryType;
  amount: Toman;
  note: string;
};

export type EntryWithBalance = Entry & { balanceAfter: Toman };

const signed = (e: Pick<Entry, "type" | "amount">) => (e.type === "debt" ? e.amount : -e.amount);

export const balanceOf = (entries: readonly Pick<Entry, "type" | "amount">[]): Toman =>
  sumToman(entries.map((e) => toman(signed(e))));

/**
 * Adds the running balance to entries given oldest first, like the columns
 * of a paper ledger.
 */
export function withRunningBalance(entries: readonly Entry[]): EntryWithBalance[] {
  let running = 0;
  return entries.map((e) => {
    running += signed(e);
    return { ...e, balanceAfter: toman(running) };
  });
}
