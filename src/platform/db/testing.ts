import { DatabaseSync } from "node:sqlite";
import { migrate } from "./migrate";
import type { Db, SqlParams } from "./types";

/**
 * In-memory database for tests, implementing the same `Db` contract as the
 * browser worker with Node's built-in SQLite — so repository SQL is tested
 * for real without a browser.
 */
export async function createTestDb(): Promise<Db> {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const exec = (sql: string, params?: SqlParams) =>
    params ? sqlite.prepare(sql).run(...params) : sqlite.exec(sql);

  const db: Db = {
    async query<T>(sql: string, params: SqlParams = []) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async run(sql, params = []) {
      const r = sqlite.prepare(sql).run(...params);
      return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        for (const s of statements) exec(s.sql, s.params);
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    async exportFile() {
      throw new Error("not supported in tests");
    },
    async importFile() {
      throw new Error("not supported in tests");
    },
  };

  await migrate(db);
  return db;
}
