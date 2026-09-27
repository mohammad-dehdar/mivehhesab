import { describe, expect, it } from "vitest";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { balanceOf, withRunningBalance, type Entry } from "./account";

let id = 0;
const entry = (type: Entry["type"], amount: number, date = "2026-09-25"): Entry => ({
  id: ++id,
  partyId: 1,
  date: date as DayKey,
  type,
  amount: toman(amount),
  note: "",
});

describe("party balance", () => {
  it("debts add, payments subtract", () => {
    expect(
      balanceOf([entry("debt", 500_000), entry("debt", 200_000), entry("payment", 300_000)]),
    ).toBe(400_000);
  });

  it("can go negative when overpaid", () => {
    expect(balanceOf([entry("debt", 100_000), entry("payment", 150_000)])).toBe(-50_000);
  });

  it("is zero with no entries", () => {
    expect(balanceOf([])).toBe(0);
  });

  it("tracks the running balance line by line", () => {
    const rows = withRunningBalance([
      entry("debt", 500_000),
      entry("payment", 200_000),
      entry("debt", 100_000),
    ]);
    expect(rows.map((r) => r.balanceAfter)).toEqual([500_000, 300_000, 400_000]);
  });
});
