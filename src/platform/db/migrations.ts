/**
 * Ordered schema migrations. The applied count is stored in SQLite's
 * `PRAGMA user_version`; append new entries, never edit applied ones.
 *
 * Money columns are whole tomans, dates are "YYYY-MM-DD" day keys.
 */
export const migrations: readonly string[] = [
  /* 1 — daybook + accounts */ `
  CREATE TABLE days (
    date       TEXT PRIMARY KEY,
    purchases  INTEGER NOT NULL DEFAULT 0 CHECK (purchases >= 0),
    sales      INTEGER NOT NULL DEFAULT 0 CHECK (sales >= 0),
    note       TEXT    NOT NULL DEFAULT '',
    updated_at TEXT    NOT NULL
  ) STRICT;

  CREATE TABLE day_expenses (
    id       INTEGER PRIMARY KEY,
    date     TEXT    NOT NULL REFERENCES days(date) ON DELETE CASCADE,
    category TEXT    NOT NULL,
    amount   INTEGER NOT NULL CHECK (amount > 0)
  ) STRICT;
  CREATE INDEX day_expenses_date ON day_expenses(date);

  CREATE TABLE parties (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL DEFAULT '',
    kind       TEXT NOT NULL CHECK (kind IN ('customer', 'supplier')),
    note       TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE party_entries (
    id         INTEGER PRIMARY KEY,
    party_id   INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    date       TEXT    NOT NULL,
    type       TEXT    NOT NULL CHECK (type IN ('debt', 'payment')),
    amount     INTEGER NOT NULL CHECK (amount > 0),
    note       TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL
  ) STRICT;
  CREATE INDEX party_entries_party ON party_entries(party_id, date);
  `,
  /* 2 — app metadata (e.g. when the last backup was taken) */ `
  CREATE TABLE meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;
  `,
];
