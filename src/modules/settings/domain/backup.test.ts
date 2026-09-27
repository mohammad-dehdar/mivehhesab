import { describe, expect, it } from "vitest";
import { looksLikeSqlite, needsBackupReminder } from "./backup";

const now = new Date("2026-09-25T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("backup reminder", () => {
  it("stays quiet while there's nothing to lose", () => {
    expect(needsBackupReminder(null, false, now)).toBe(false);
  });
  it("asks when there's data but no backup yet", () => {
    expect(needsBackupReminder(null, true, now)).toBe(true);
  });
  it("asks again after a week", () => {
    expect(needsBackupReminder(daysAgo(6), true, now)).toBe(false);
    expect(needsBackupReminder(daysAgo(7), true, now)).toBe(true);
  });
});

describe("looksLikeSqlite", () => {
  it("accepts the SQLite header and rejects other files", () => {
    const db = new Uint8Array(100);
    db.set(new TextEncoder().encode("SQLite format 3\0"));
    expect(looksLikeSqlite(db)).toBe(true);
    expect(looksLikeSqlite(new TextEncoder().encode("PK\x03\x04 not a database".padEnd(120)))).toBe(
      false,
    );
  });
});
