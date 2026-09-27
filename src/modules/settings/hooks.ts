"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { migrate, useDb } from "@/platform/db";
import { todayKey } from "@/shared/lib/date";
import { settingsRepository } from "./data/repository";
import { backupFileName, looksLikeSqlite } from "./domain/backup";

const keys = { backup: ["settings", "backup"] as const, storage: ["settings", "storage"] as const };

function useRepository() {
  const db = useDb();
  return useMemo(() => settingsRepository(db), [db]);
}

export function useBackupStatus() {
  const repo = useRepository();
  return useQuery({
    queryKey: keys.backup,
    queryFn: async () => ({
      lastBackupAt: await repo.lastBackupAt(),
      hasData: await repo.hasData(),
    }),
  });
}

/** Whether the browser promised to keep our data, and how much space is used. */
export function useStorageStatus() {
  return useQuery({
    queryKey: keys.storage,
    queryFn: async () => ({
      persisted: (await navigator.storage?.persisted?.()) ?? false,
      usage: (await navigator.storage?.estimate?.())?.usage ?? null,
    }),
  });
}

function download(bytes: Uint8Array, fileName: string) {
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], { type: "application/vnd.sqlite3" }),
  );
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Saves the whole database as a .db file (goes to Downloads on Android). */
export function useExportBackup() {
  const db = useDb();
  const repo = useRepository();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await repo.markBackedUp();
      download(await db.exportFile(), backupFileName(todayKey()));
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.backup }),
  });
}

export class InvalidBackupError extends Error {}

/** Replaces everything on this device with the contents of a backup file. */
export function useRestoreBackup() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!looksLikeSqlite(bytes)) throw new InvalidBackupError();
      await db.importFile(bytes);
      await migrate(db); // backups from older versions get upgraded
    },
    onSuccess: () => client.invalidateQueries(),
  });
}
