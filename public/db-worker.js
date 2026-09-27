// SQLite database worker. Runs SQLite (WASM) on the "opfs-sahpool" VFS, which
// stores the database file in the browser's private file system (OPFS) on this
// device and needs no special HTTP headers. The main thread talks to it through
// src/platform/db/client.ts; every message is handled to completion before the
// next, so a batch inside BEGIN…COMMIT is atomic.
import sqlite3InitModule from "./sqlite/index.mjs";

const DB_FILE = "/fruit.db";

let sqlite3;
let pool;
let db;

function open() {
  db = new pool.OpfsSAHPoolDb(DB_FILE);
  db.exec("PRAGMA foreign_keys = ON;");
}

async function init() {
  sqlite3 = await sqlite3InitModule();
  pool = await sqlite3.installOpfsSAHPoolVfs({
    name: "fruit-sahpool",
    directory: "/fruit-accountant",
  });
  open();
}

function rows(sql, params) {
  return db.exec({ sql, bind: params, rowMode: "object", returnValue: "resultRows" });
}

function run(sql, params) {
  db.exec({ sql, bind: params });
  return {
    changes: db.changes(),
    lastInsertRowid: Number(db.selectValue("SELECT last_insert_rowid()")),
  };
}

function batch(statements) {
  db.exec("BEGIN");
  try {
    for (const s of statements) db.exec({ sql: s.sql, bind: s.params });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function importFile(bytes) {
  // Check the bytes open as a database before touching the real file.
  const header = new TextDecoder().decode(bytes.slice(0, 15));
  if (header !== "SQLite format 3") throw new Error("NOT_A_DATABASE");
  db.close();
  try {
    await pool.importDb(DB_FILE, bytes);
  } finally {
    open();
  }
}

const handlers = {
  query: ({ sql, params }) => rows(sql, params),
  run: ({ sql, params }) => run(sql, params),
  batch: ({ statements }) => batch(statements),
  exportFile: () => pool.exportFile(DB_FILE),
  importFile: ({ bytes }) => importFile(bytes),
};

const ready = init();

// Strictly one message at a time (an import closes and reopens the database).
let queue = ready.catch(() => {});

self.onmessage = ({ data: { id, type, payload } }) => {
  queue = queue.then(async () => {
    try {
      await ready;
      const result = await handlers[type](payload);
      self.postMessage({ id, ok: true, result });
    } catch (error) {
      self.postMessage({ id, ok: false, error: error?.message ?? String(error) });
    }
  });
};

ready.then(
  () => self.postMessage({ type: "ready" }),
  (error) => self.postMessage({ type: "failed", error: error?.message ?? String(error) }),
);
