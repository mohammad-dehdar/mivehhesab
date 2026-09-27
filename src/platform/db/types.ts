export type SqlValue = string | number | null;
export type SqlParams = readonly SqlValue[];
export type Statement = { sql: string; params?: SqlParams };
export type RunResult = { changes: number; lastInsertRowid: number };

/**
 * The one database contract every repository codes against. In the browser it
 * is backed by the SQLite worker (see client.ts); in tests by Node's built-in
 * SQLite (see testing.ts) — same SQL, same behaviour.
 */
export interface Db {
  query<T>(sql: string, params?: SqlParams): Promise<T[]>;
  run(sql: string, params?: SqlParams): Promise<RunResult>;
  /** Runs all statements in one transaction: all succeed or none do. */
  batch(statements: readonly Statement[]): Promise<void>;
  /** The whole database file (for backups). */
  exportFile(): Promise<Uint8Array>;
  /** Replaces the whole database with the given file (restore from backup). */
  importFile(bytes: Uint8Array): Promise<void>;
}
