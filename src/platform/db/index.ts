// Browser-side database platform. Tests use "@/platform/db/testing" instead.
export { DbError, type DbErrorCode } from "./client";
export { migrate, SCHEMA_VERSION } from "./migrate";
export { DbProvider, useDb } from "./provider";
export type { Db, RunResult, SqlParams, SqlValue, Statement } from "./types";
