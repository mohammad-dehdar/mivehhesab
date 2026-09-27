import type { Db } from "@/platform/db";
import type { DayKey } from "@/shared/lib/date";
import { toman, type Toman } from "@/shared/lib/money";
import type { Entry, Party, PartyKind, PartyWithBalance } from "../domain/account";

type PartyRow = {
  id: number;
  name: string;
  phone: string;
  kind: PartyKind;
  note: string;
  balance: number;
  last_entry_date: string | null;
};

type EntryRow = {
  id: number;
  party_id: number;
  date: string;
  type: Entry["type"];
  amount: number;
  note: string;
};

const PARTY_SELECT = `
  SELECT p.id, p.name, p.phone, p.kind, p.note,
         COALESCE(SUM(CASE e.type WHEN 'debt' THEN e.amount ELSE -e.amount END), 0) AS balance,
         MAX(e.date) AS last_entry_date
  FROM parties p
  LEFT JOIN party_entries e ON e.party_id = p.id`;

const toParty = (r: PartyRow): PartyWithBalance => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  kind: r.kind,
  note: r.note,
  balance: toman(r.balance),
  lastEntryDate: r.last_entry_date as DayKey | null,
});

const toEntry = (r: EntryRow): Entry => ({
  id: r.id,
  partyId: r.party_id,
  date: r.date as DayKey,
  type: r.type,
  amount: toman(r.amount),
  note: r.note,
});

/** All accounts-book reads and writes, against any `Db`. */
export function accountsRepository(db: Db) {
  return {
    /** People of one kind; the largest outstanding balances first. */
    async listParties(kind: PartyKind): Promise<PartyWithBalance[]> {
      const rows = await db.query<PartyRow>(
        `${PARTY_SELECT} WHERE p.kind = ? GROUP BY p.id ORDER BY balance DESC, p.name`,
        [kind],
      );
      return rows.map(toParty);
    },

    async findParty(id: number): Promise<PartyWithBalance | null> {
      const [row] = await db.query<PartyRow>(`${PARTY_SELECT} WHERE p.id = ? GROUP BY p.id`, [id]);
      return row ? toParty(row) : null;
    },

    /** A person's ledger, oldest first. */
    async listEntries(partyId: number): Promise<Entry[]> {
      const rows = await db.query<EntryRow>(
        `SELECT id, party_id, date, type, amount, note FROM party_entries
         WHERE party_id = ? ORDER BY date, id`,
        [partyId],
      );
      return rows.map(toEntry);
    },

    /** Sum of positive balances per kind: what customers owe / what the shop owes suppliers. */
    async outstandingTotals(): Promise<Record<PartyKind, Toman>> {
      const rows = await db.query<{ kind: PartyKind; total: number }>(
        `SELECT kind, COALESCE(SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END), 0) AS total
         FROM (${PARTY_SELECT} GROUP BY p.id) GROUP BY kind`,
      );
      const totals = { customer: toman(0), supplier: toman(0) };
      for (const r of rows) totals[r.kind] = toman(r.total);
      return totals;
    },

    async insertParty(p: Omit<Party, "id">): Promise<number> {
      const { lastInsertRowid } = await db.run(
        "INSERT INTO parties (name, phone, kind, note, created_at) VALUES (?, ?, ?, ?, ?)",
        [p.name, p.phone, p.kind, p.note, new Date().toISOString()],
      );
      return lastInsertRowid;
    },

    async updateParty(p: Party): Promise<void> {
      await db.run("UPDATE parties SET name = ?, phone = ?, kind = ?, note = ? WHERE id = ?", [
        p.name,
        p.phone,
        p.kind,
        p.note,
        p.id,
      ]);
    },

    /** Deletes a person and (by cascade) their whole ledger. */
    async deleteParty(id: number): Promise<void> {
      await db.run("DELETE FROM parties WHERE id = ?", [id]);
    },

    async insertEntry(e: Omit<Entry, "id">): Promise<void> {
      await db.run(
        `INSERT INTO party_entries (party_id, date, type, amount, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [e.partyId, e.date, e.type, e.amount, e.note, new Date().toISOString()],
      );
    },

    async deleteEntry(id: number): Promise<void> {
      await db.run("DELETE FROM party_entries WHERE id = ?", [id]);
    },
  };
}

export type AccountsRepository = ReturnType<typeof accountsRepository>;
