import type { Db } from "@/platform/db";

const LAST_BACKUP = "last_backup_at";

/** Small key/value facts about the app itself (not business data). */
export function settingsRepository(db: Db) {
  return {
    async lastBackupAt(): Promise<Date | null> {
      const [row] = await db.query<{ value: string }>("SELECT value FROM meta WHERE key = ?", [
        LAST_BACKUP,
      ]);
      return row ? new Date(row.value) : null;
    },

    async markBackedUp(at = new Date()): Promise<void> {
      await db.run(
        `INSERT INTO meta (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [LAST_BACKUP, at.toISOString()],
      );
    },

    /** Whether there is any business data yet (to decide if a backup reminder makes sense). */
    async hasData(): Promise<boolean> {
      const [row] = await db.query<{ n: number }>(
        "SELECT (SELECT COUNT(*) FROM days) + (SELECT COUNT(*) FROM parties) AS n",
      );
      return row.n > 0;
    },
  };
}
