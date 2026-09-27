"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DatabaseIcon, TriangleAlertIcon } from "lucide-react";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { createWorkerDb, DbError, type DbErrorCode } from "./client";
import { migrate } from "./migrate";
import type { Db } from "./types";

const DbContext = createContext<Db | null>(null);

/** The open database. Only usable below <DbProvider>, which renders children once it's ready. */
export function useDb(): Db {
  const db = use(DbContext);
  if (!db) throw new Error("useDb must be used inside <DbProvider>");
  return db;
}

// One database connection per page load, shared by every screen.
let opening: Promise<Db> | null = null;

function openDb(): Promise<Db> {
  opening ??= createWorkerDb()
    .then(async (db) => {
      await migrate(db);
      // Ask the browser not to evict our data when the device is low on space.
      await navigator.storage?.persist?.().catch(() => false);
      return db;
    })
    .catch((error) => {
      opening = null; // allow "try again"
      throw error;
    });
  return opening;
}

const MESSAGES: Record<DbErrorCode, { title: string; body: string }> = {
  UNSUPPORTED: {
    title: "این مرورگر پشتیبانی نمی‌شود",
    body: "برای ذخیره‌ی اطلاعات روی دستگاه، برنامه را با Chrome (نسخه‌ی جدید) باز کنید.",
  },
  LOCKED: {
    title: "برنامه در جای دیگری باز است",
    body: "برنامه در یک زبانه یا پنجره‌ی دیگر باز است. آن را ببندید و دوباره تلاش کنید.",
  },
  NOT_A_DATABASE: {
    title: "فایل اطلاعات خراب است",
    body: "یک فایل پشتیبان سالم را بازگردانی کنید.",
  },
  DB_FROM_NEWER_VERSION: {
    title: "نسخه‌ی برنامه قدیمی است",
    body: "اطلاعات با نسخه‌ی جدیدتری ذخیره شده. صفحه را دوباره بارگذاری کنید تا برنامه به‌روز شود.",
  },
  UNKNOWN: { title: "باز کردن اطلاعات ناموفق بود", body: "یک بار دیگر تلاش کنید." },
};

export function DbProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } }),
  );
  const [db, setDb] = useState<Db | null>(null);
  const [error, setError] = useState<DbErrorCode | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    openDb().then(
      (opened) => !cancelled && setDb(opened),
      (e) => !cancelled && setError(e instanceof DbError ? e.code : "UNKNOWN"),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (error) {
    const message = MESSAGES[error];
    return (
      <Card className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 py-10 text-center">
        <TriangleAlertIcon className="text-danger size-10" />
        <p className="text-lg font-bold">{message.title}</p>
        <p className="text-muted-foreground">{message.body}</p>
        <Button
          onClick={() => {
            setError(null);
            setAttempt((n) => n + 1);
          }}
        >
          تلاش دوباره
        </Button>
      </Card>
    );
  }

  if (!db) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-20" aria-busy>
        <DatabaseIcon className="size-8 animate-pulse" />
        <span>در حال باز کردن اطلاعات…</span>
      </div>
    );
  }

  return (
    <DbContext value={db}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DbContext>
  );
}
