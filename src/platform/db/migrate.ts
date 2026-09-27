import { migrations } from "./migrations";
import type { Db } from "./types";

/**
 * Brings the schema up to date. The number of applied migrations is kept in
 * SQLite's `PRAGMA user_version`, so this also upgrades restored backups
 * taken with an older version of the app.
 */
export async function migrate(db: Db): Promise<void> {
  const [{ user_version: applied }] = await db.query<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if (applied > migrations.length) throw new Error("DB_FROM_NEWER_VERSION");
  for (let i = applied; i < migrations.length; i++) {
    await db.batch([{ sql: migrations[i] }, { sql: `PRAGMA user_version = ${i + 1}` }]);
  }
}

export const SCHEMA_VERSION = migrations.length;
