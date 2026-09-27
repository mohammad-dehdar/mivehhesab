import type { DayKey } from "@/shared/lib/date";

/** Remind the seller to back up after this many days without one. */
export const BACKUP_REMINDER_DAYS = 7;

export function daysSince(date: Date, now = new Date()): number {
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

export function needsBackupReminder(lastBackupAt: Date | null, hasData: boolean, now = new Date()) {
  if (!hasData) return false;
  return lastBackupAt === null || daysSince(lastBackupAt, now) >= BACKUP_REMINDER_DAYS;
}

/** "fruit-backup-2026-09-25.db" — Latin digits so every file manager sorts it correctly. */
export const backupFileName = (today: DayKey) => `fruit-backup-${today}.db`;

/** SQLite files always start with this 16-byte header. */
export function looksLikeSqlite(bytes: Uint8Array): boolean {
  const header = "SQLite format 3\0";
  return bytes.length >= 100 && [...header].every((c, i) => bytes[i] === c.charCodeAt(0));
}
