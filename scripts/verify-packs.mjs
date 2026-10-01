// Packs every publishable workspace package and checks that each path in the
// packed package.json's `exports` and `bin` exists in the tarball.
// Run after `pnpm build`.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** All files under dir, as "./relative/path" with forward slashes. */
function listFiles(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory()
      ? listFiles(full, base)
      : ["./" + path.relative(base, full).split(path.sep).join("/")];
  });
}

const root = path.resolve(import.meta.dirname, "..");
const packagesDir = path.join(root, "packages");

const collectPaths = (value) =>
  typeof value === "string"
    ? [value]
    : value && typeof value === "object"
      ? Object.values(value).flatMap(collectPaths)
      : [];

let failures = 0;

for (const name of readdirSync(packagesDir)) {
  const dir = path.join(packagesDir, name);
  const manifestPath = path.join(dir, "package.json");
  if (!existsSync(manifestPath)) continue;
  if (JSON.parse(readFileSync(manifestPath, "utf8")).private) continue;

  const out = mkdtempSync(path.join(os.tmpdir(), "verify-pack-"));
  try {
    execFileSync("pnpm", ["pack", "--pack-destination", out], {
      cwd: dir,
      stdio: "ignore",
      shell: process.platform === "win32",
    });
    const tarball = readdirSync(out).find((f) => f.endsWith(".tgz"));
    execFileSync("tar", ["-xzf", tarball], { cwd: out });

    const packed = JSON.parse(
      readFileSync(path.join(out, "package", "package.json"), "utf8"),
    );
    const targets = [...collectPaths(packed.exports), ...collectPaths(packed.bin)];
    const files = listFiles(path.join(out, "package"));
    const exists = (p) => {
      if (!p.includes("*")) return existsSync(path.join(out, "package", p));
      // Subpath patterns must match at least one packed file
      const [prefix, suffix] = p.split("*");
      return files.some((f) => f.startsWith(prefix) && f.endsWith(suffix) && f.length > prefix.length + suffix.length);
    };
    const missing = targets.filter(
      (p) => p.endsWith(".ts") && !p.endsWith(".d.ts")
        ? true // source files must never be published as entry points
        : !exists(p),
    );

    if (targets.length === 0 || missing.length > 0) {
      failures++;
      console.error(
        `✗ ${packed.name}: ${targets.length === 0 ? "no exports or bin" : `broken entry points: ${missing.join(", ")}`}`,
      );
    } else {
      console.log(`✓ ${packed.name} (${targets.length} entry points)`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

process.exit(failures > 0 ? 1 : 0);
