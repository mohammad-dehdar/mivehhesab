import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "@/platform/db/testing";
import type { DayKey } from "@/shared/lib/date";
import { toman } from "@/shared/lib/money";
import { daybookRepository, type DaybookRepository } from "./repository";

const M = 1_000_000;
const d = (s: string) => s as DayKey;

let repo: DaybookRepository;

beforeEach(async () => {
  repo = daybookRepository(await createTestDb());
});

const day = (
  date: string,
  purchases: number,
  sales: number,
  expenses: [string, number][] = [],
) => ({
  date: d(date),
  purchases: toman(purchases),
  sales: toman(sales),
  note: "",
  expenses: expenses.map(([category, amount]) => ({ category, amount: toman(amount) })),
});

describe("daybook repository", () => {
  it("saves and reads back a day with expenses in order", async () => {
    await repo.saveDay(
      day("2026-09-25", 35 * M, 58 * M, [
        ["حمل و بار", 1000],
        ["کارگر", 500_000],
      ]),
    );
    const saved = await repo.findDay(d("2026-09-25"));
    expect(saved?.sales).toBe(58 * M);
    expect(saved?.expenses.map((e) => e.category)).toEqual(["حمل و بار", "کارگر"]);
  });

  it("replaces a day's expenses on re-save instead of duplicating them", async () => {
    await repo.saveDay(
      day("2026-09-25", 1000, 2000, [
        ["کارگر", 100],
        ["قبض", 50],
      ]),
    );
    await repo.saveDay(day("2026-09-25", 1000, 3000, [["کارگر", 200]]));
    const [summary] = await repo.listSummaries();
    expect(summary).toMatchObject({ sales: 3000, expenses: 200 });
  });

  it("computes all-time totals (the seller's 2-day example)", async () => {
    await repo.saveDay(day("2026-09-24", 2 * M, 4 * M));
    await repo.saveDay(day("2026-09-25", 4 * M, 7 * M));
    expect(await repo.allTimeTotals()).toEqual({
      purchases: 6 * M,
      sales: 11 * M,
      expenses: 0,
      profit: 5 * M,
      days: 2,
      firstDay: "2026-09-24",
    });
  });

  it("filters summaries by range, newest first", async () => {
    for (const date of ["2026-09-20", "2026-09-22", "2026-09-25"])
      await repo.saveDay(day(date, 1, 2));
    const rows = await repo.listSummaries({ from: d("2026-09-21"), to: d("2026-09-25") });
    expect(rows.map((r) => r.date)).toEqual(["2026-09-25", "2026-09-22"]);
  });

  it("deleting a day removes its expenses too", async () => {
    await repo.saveDay(day("2026-09-25", 1, 2, [["کارگر", 100]]));
    await repo.deleteDay(d("2026-09-25"));
    expect(await repo.findDay(d("2026-09-25"))).toBeNull();
    expect((await repo.allTimeTotals()).expenses).toBe(0);
  });

  it("rolls back the whole save if one expense is invalid", async () => {
    await expect(
      repo.saveDay(
        day("2026-09-25", 1, 2, [
          ["کارگر", 100],
          ["بد", -5],
        ]),
      ),
    ).rejects.toThrow();
    expect(await repo.findDay(d("2026-09-25"))).toBeNull();
  });
});
