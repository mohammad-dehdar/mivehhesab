// Creates .nojekyll and CNAME files in the output directory after build.
// Usage: node scripts/post-build.mjs [output-dir]   (default: out)
import { writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] ?? "out");

// Tell GitHub Pages not to process with Jekyll (preserves folders starting with _).
writeFileSync(path.join(OUT, ".nojekyll"), "");

// Custom domain mapping.
writeFileSync(path.join(OUT, "CNAME"), "mivehhesab.ir\n");

console.log(`post-build: .nojekyll + CNAME written to ${path.relative(process.cwd(), OUT)}/`);
