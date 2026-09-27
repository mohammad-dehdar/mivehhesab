import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "@/platform/db/testing";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { accountsRepository, type AccountsRepository } from "./repository";

let repo: AccountsRepository;

beforeEach(async () => {
  repo = accountsRepository(await createTestDb());
});

const party = (name: string, kind: "customer" | "supplier" = "customer") =>
  repo.insertParty({ name, phone: "", kind, note: "" });

const entry = (partyId: number, type: "debt" | "payment", amount: number, date = "2026-09-25") =>
  repo.insertEntry({ partyId, date: date as DayKey, type, amount: toman(amount), note: "" });

describe("accounts repository", () => {
  it("derives each person's balance and last entry date", async () => {
    const id = await party("آقای رضایی");
    await entry(id, "debt", 500_000, "2026-09-20");
    await entry(id, "payment", 200_000, "2026-09-25");
    expect(await repo.findParty(id)).toMatchObject({
      balance: 300_000,
      lastEntryDate: "2026-09-25",
    });
  });

  it("lists one kind, biggest debt first, including people with no entries", async () => {
    const a = await party("الف");
    const b = await party("ب");
    await party("بارفروش", "supplier");
    await entry(b, "debt", 900);
    await entry(a, "debt", 100);
    await party("بی‌حساب");
    const list = await repo.listParties("customer");
    expect(list.map((p) => [p.name, p.balance])).toEqual([
      ["ب", 900],
      ["الف", 100],
      ["بی‌حساب", 0],
    ]);
  });

  it("totals only positive balances per kind", async () => {
    const c1 = await party("مشتری ۱");
    const c2 = await party("مشتری ۲");
    const s = await party("بارفروش", "supplier");
    await entry(c1, "debt", 400);
    await entry(c2, "payment", 50); // overpaid: not counted as money owed
    await entry(s, "debt", 1000);
    expect(await repo.outstandingTotals()).toEqual({ customer: 400, supplier: 1000 });
  });

  it("deleting a person removes their ledger", async () => {
    const id = await party("موقت");
    await entry(id, "debt", 100);
    await repo.deleteParty(id);
    expect(await repo.findParty(id)).toBeNull();
    expect(await repo.listEntries(id)).toEqual([]);
  });
});
