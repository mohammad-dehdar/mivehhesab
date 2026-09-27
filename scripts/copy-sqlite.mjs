// Copies the SQLite WASM build into public/sqlite so the database worker
// (public/db-worker.js) can load it without going through the bundler.
import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve("@sqlite.org/sqlite-wasm/sqlite3.wasm"));
const target = path.resolve("public/sqlite");

mkdirSync(target, { recursive: true });
for (const file of ["index.mjs", "sqlite3.wasm"]) {
  cpSync(path.join(dist, file), path.join(target, file));
}
console.log(`sqlite-wasm copied to ${path.relative(process.cwd(), target)}`);
