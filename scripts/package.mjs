// Zips out/ into deploy/fruit-accountant-site.zip for drag-and-drop upload
// (e.g. Cloudflare dashboard). Uses the OS zip tool; paths use "/" so the
// archive unpacks correctly on the (Linux) host.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const zip = path.resolve("deploy/fruit-accountant-site.zip");
// Top-level names (not ".") so entries are "index.html", not "./index.html".
const entries = readdirSync("out");
mkdirSync(path.dirname(zip), { recursive: true });
rmSync(zip, { force: true });

if (process.platform === "win32") {
  // Windows' bsdtar writes proper zip entries (PowerShell's Compress-Archive uses "\").
  const tar = path.join(process.env.SystemRoot ?? "C:/Windows", "System32", "tar.exe");
  execFileSync(tar, ["-a", "-c", "-f", zip, ...entries], { cwd: "out" });
} else {
  execFileSync("zip", ["-r", "-q", zip, ...entries], { cwd: "out" });
}
console.log(`packaged ${path.relative(process.cwd(), zip)}`);
