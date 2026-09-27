// Works around a Windows bug in Next 16's static export: per-segment prefetch
// files should be flat ("day/__next.<group>.day.__PAGE__.txt"), but on Windows
// the segment path contains backslashes, which `path.join` turns into nested
// folders ("day/__next.<group>/day/__PAGE__.txt"). The client then gets 404s
// when prefetching links. This flattens them to the names Next requests.
// No-op on macOS/Linux builds, where the files are already flat.
import { readdirSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : [full];
  });
}

let moved = 0;

function visit(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (!name.startsWith("__next.")) {
      visit(full);
      continue;
    }
    for (const file of filesUnder(full)) {
      const parts = path.relative(full, file).split(path.sep);
      renameSync(file, path.join(dir, `${name}.${parts.join(".")}`));
      moved++;
    }
    rmSync(full, { recursive: true });
  }
}

visit(OUT);
console.log(`segment files flattened: ${moved}`);
