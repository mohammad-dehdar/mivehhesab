import type { Db, RunResult, SqlParams, Statement } from "./types";

type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void };

/** Errors the UI knows how to explain; anything else is shown as a generic failure. */
export type DbErrorCode =
  "UNSUPPORTED" | "LOCKED" | "NOT_A_DATABASE" | "DB_FROM_NEWER_VERSION" | "UNKNOWN";

export class DbError extends Error {
  constructor(
    readonly code: DbErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function classify(message: string): DbErrorCode {
  if (message.includes("NOT_A_DATABASE") || message.includes("not a database"))
    return "NOT_A_DATABASE";
  if (message.includes("DB_FROM_NEWER_VERSION")) return "DB_FROM_NEWER_VERSION";
  // The SAH pool can only be opened by one tab at a time.
  if (/NoModificationAllowed|Access Handles|createSyncAccessHandle/i.test(message)) return "LOCKED";
  return "UNKNOWN";
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Opens the SQLite worker and resolves once the database file is open. */
export function createWorkerDb(): Promise<Db> {
  if (typeof Worker === "undefined" || !navigator.storage?.getDirectory) {
    return Promise.reject(new DbError("UNSUPPORTED", "OPFS is not available"));
  }

  const worker = new Worker(`${basePath}/db-worker.js`, { type: "module" });
  const pending = new Map<number, Pending>();
  let nextId = 0;

  const call = <T>(type: string, payload?: unknown, transfer: Transferable[] = []) =>
    new Promise<T>((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      worker.postMessage({ id, type, payload }, transfer);
    });

  const db: Db = {
    query: <T>(sql: string, params?: SqlParams) => call<T[]>("query", { sql, params }),
    run: (sql: string, params?: SqlParams) => call<RunResult>("run", { sql, params }),
    batch: (statements: readonly Statement[]) => call<void>("batch", { statements }),
    exportFile: () => call<Uint8Array>("exportFile"),
    importFile: (bytes: Uint8Array) => call<void>("importFile", { bytes }),
  };

  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      if (data.type === "ready") return resolve(db);
      if (data.type === "failed") {
        worker.terminate();
        return reject(new DbError(classify(data.error), data.error));
      }
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      if (data.ok) entry.resolve(data.result);
      else entry.reject(new DbError(classify(data.error), data.error));
    };
    worker.onerror = (event) => {
      reject(new DbError("UNKNOWN", event.message || "Database worker failed to start"));
    };
  });
}
