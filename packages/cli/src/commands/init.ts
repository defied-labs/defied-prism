import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { buildThemeCss } from "@defied/prism-tokens";
import { checkbox, confirm, input, select } from "@inquirer/prompts";

import type { PrismConfig } from "../config/types";
import { defaultRegistryPath } from "../registry/defaultRegistry";
import { addCommand } from "./add";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Every option is a flag. In the developer flow, anything a flag doesn't
 * answer is asked; in the automation flow (`--yes`, no TTY, or CI) nothing
 * is asked: missing options fall back to what the project suggests.
 */
export interface InitOptions {
  /** Default: detected from package.json, else react. */
  framework?: PrismConfig["framework"];
  /** Default: tailwind when the project uses Tailwind (or has no package.json), else css-modules. */
  style?: PrismConfig["styling"];
  /** Where components are written. Default: src/components/ui. */
  componentsPath?: string;
  /** Brand color. Default: none (Prism's palette). */
  primary?: string;
  /** Package manager. Default: from the lockfile, else npm. */
  packageManager?: PackageManager;
  /** Components to add once initialized. */
  add?: string[];
  /** `--no-install` sets this to false. */
  install?: boolean;
  /** Overwrite an existing prism.json. */
  force?: boolean;
  /** Never prompt (the automation flow). */
  yes?: boolean;
  cwd?: string;
}

const STYLESHEET_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/main.css",
  "src/style.css",
  "src/styles.css",
  "src/assets/main.css",
  "src/app.css",
  "app/app.css",
];

const TAILWIND_IMPORT = /^\s*@import\s+["']tailwindcss["'].*$/m;

const DEFAULT_COMPONENTS_PATH = "src/components/ui";

const isInteractive = () => Boolean(process.stdin.isTTY && process.stdout.isTTY);
const isCI = () => Boolean(process.env.CI) && process.env.CI !== "false";

/** The automation flow: `--yes`, or nobody at a terminal to answer. */
export function isAutomated(options: Pick<InitOptions, "yes">): boolean {
  return Boolean(options.yes) || !isInteractive() || isCI();
}

export interface DetectedProject {
  hasPackageJson: boolean;
  framework?: PrismConfig["framework"];
  tailwind: boolean;
}

/** What the project's package.json says about it. */
export async function detectProject(cwd: string): Promise<DetectedProject> {
  const file = path.join(cwd, "package.json");
  if (!existsSync(file)) return { hasPackageJson: false, tailwind: false };
  let deps: Record<string, string> = {};
  try {
    const pkg = JSON.parse(await fs.readFile(file, "utf8"));
    deps = { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    // An unreadable package.json suggests nothing
  }
  const has = (name: string) => name in deps;
  const framework = has("vue") || has("nuxt") ? "vue" : has("react") || has("next") ? "react" : undefined;
  return { hasPackageJson: true, framework, tailwind: has("tailwindcss") };
}

/** Registry component names, for the starter components question and `--add` validation. */
export async function registryComponents(registryPath = defaultRegistryPath()): Promise<string[]> {
  const dir = path.join(registryPath, "components");
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && existsSync(path.join(dir, entry.name, "manifest.json")))
    .map((entry) => entry.name)
    .sort();
}

/** The package manager a lockfile commits the project to, if any. */
export function detectPackageManager(cwd: string): PackageManager | undefined {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb")) || existsSync(path.join(cwd, "bun.lock"))) return "bun";
  if (existsSync(path.join(cwd, "package-lock.json"))) return "npm";
  return undefined;
}

async function resolvePackageManager(
  cwd: string,
  preferred: PackageManager | undefined,
  automated: boolean,
): Promise<PackageManager> {
  const detected = detectPackageManager(cwd);
  if (preferred) {
    if (detected && detected !== preferred) {
      console.warn(`⚠ Using ${preferred}, but this project has a ${detected} lockfile.`);
    }
    return preferred;
  }
  // A lockfile already answers the question; asking would invite a mismatch
  if (detected) return detected;
  if (automated) return "npm";
  return select<PackageManager>({
    message: "Package manager",
    choices: [
      { name: "npm", value: "npm" },
      { name: "pnpm", value: "pnpm" },
      { name: "yarn", value: "yarn" },
      { name: "bun", value: "bun" },
    ],
  });
}

export function runtimePackages(framework: PrismConfig["framework"]) {
  return ["@defied/prism-tokens", `@defied/prism-${framework}`, "@defied/prism-core"];
}

/** The project's global stylesheet: the one importing Tailwind, else a conventional path. */
export async function findGlobalStylesheet(cwd: string): Promise<string | undefined> {
  const existing = STYLESHEET_CANDIDATES.map((rel) => path.join(cwd, rel)).filter((file) => existsSync(file));
  for (const file of existing) {
    if (TAILWIND_IMPORT.test(await fs.readFile(file, "utf8"))) return file;
  }
  return existing[0];
}

/**
 * Adds the Prism imports to a stylesheet, skipping ones already present.
 * Order: tailwindcss → tokens.css → tailwind.css → theme file.
 */
export function addStylesheetImports(css: string, styling: PrismConfig["styling"], themeImport?: string) {
  const wanted = [`@import "@defied/prism-tokens/tokens.css";`];
  if (styling === "tailwind") wanted.push(`@import "@defied/prism-tokens/tailwind.css";`);
  if (themeImport) wanted.push(`@import "${themeImport}";`);

  const missing = wanted.filter((line) => !css.includes(line.slice(9, -2)));
  if (missing.length === 0) return css;

  const block = missing.join("\n");
  const tailwind = css.match(TAILWIND_IMPORT);
  if (tailwind?.index !== undefined) {
    const end = tailwind.index + tailwind[0].length;
    return `${css.slice(0, end)}\n${block}${css.slice(end)}`;
  }
  return `${block}\n${css}`;
}

function validateColor(color: string) {
  buildThemeCss({ light: { primary: color } });
}

async function promptBrandColor(): Promise<string | undefined> {
  const answer = await input({
    message: "Brand color (hex, rgb() or oklch(); Enter to skip)",
    validate: (value) => {
      if (!value.trim()) return true;
      try {
        validateColor(value.trim());
        return true;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    },
  });
  return answer.trim() || undefined;
}

function installPackages(cwd: string, pm: PackageManager, framework: PrismConfig["framework"]) {
  const args = [pm === "npm" ? "install" : "add", ...runtimePackages(framework)];
  console.log(`\n→ ${pm} ${args.join(" ")}`);
  const result = spawnSync(pm, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.warn(`\n⚠ Install failed. Run it yourself:\n  ${pm} ${args.join(" ")}`);
    return false;
  }
  return true;
}

export interface InitPlan {
  framework: PrismConfig["framework"];
  styling: PrismConfig["styling"];
  componentsPath: string;
  primary?: string;
  /** Undefined: don't install (no package.json, or `--no-install`). */
  packageManager?: PackageManager;
  add: string[];
}

/**
 * Resolves every answer before anything is written: from flags, then (in
 * the developer flow) prompts, then what the project suggests. Returns
 * null when the developer declines to overwrite prism.json.
 */
export async function planInit(options: InitOptions, cwd: string, automated: boolean): Promise<InitPlan | null> {
  if (existsSync(path.join(cwd, "prism.json")) && !options.force) {
    if (automated) throw new Error("[prism] prism.json already exists. Pass --force to overwrite it.");
    if (!(await confirm({ message: "prism.json already exists. Overwrite it?", default: false }))) return null;
  }

  const project = await detectProject(cwd);
  const suggestedStyling = project.tailwind || !project.hasPackageJson ? "tailwind" : "css-modules";

  // Fail on bad flags before asking anything
  if (options.primary) validateColor(options.primary);
  const known = await registryComponents();
  const unknown = (options.add ?? []).filter((name) => !known.includes(name));
  if (unknown.length) {
    throw new Error(
      `[prism] Unknown component${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Available: ${known.join(", ")}.`,
    );
  }

  const framework =
    options.framework ??
    (automated
      ? (project.framework ?? "react")
      : await select<PrismConfig["framework"]>({
          message: "Framework",
          default: project.framework ?? "react",
          choices: [
            { name: "React", value: "react" },
            { name: "Vue", value: "vue" },
          ],
        }));

  const styling =
    options.style ??
    (automated
      ? suggestedStyling
      : await select<PrismConfig["styling"]>({
          message: "Styling",
          default: suggestedStyling,
          choices: [
            { name: "Tailwind CSS", value: "tailwind", description: project.tailwind ? "Detected in package.json" : undefined },
            { name: "CSS Modules", value: "css-modules" },
            { name: "Plain CSS", value: "css" },
          ],
        }));

  const componentsPath =
    options.componentsPath ??
    (automated
      ? DEFAULT_COMPONENTS_PATH
      : (await input({ message: "Components directory", default: DEFAULT_COMPONENTS_PATH })).trim() ||
        DEFAULT_COMPONENTS_PATH);

  const primary = options.primary ?? (automated ? undefined : await promptBrandColor());

  const packageManager =
    options.install !== false && project.hasPackageJson
      ? await resolvePackageManager(cwd, options.packageManager, automated)
      : undefined;

  const add =
    options.add ??
    (automated
      ? []
      : await checkbox<string>({
          message: "Add components now (Space to select, Enter to continue)",
          choices: known.map((name) => ({ name, value: name })),
          pageSize: 12,
        }));

  return { framework, styling, componentsPath, primary, packageManager, add };
}

/** The non-interactive command that reproduces a plan, for CI and scripts. */
export function automationCommand(plan: InitPlan, options: Pick<InitOptions, "install" | "force"> = {}): string {
  const args = ["npx @defied/prism-cli init --yes", `--framework ${plan.framework}`, `--style ${plan.styling}`];
  if (plan.componentsPath !== DEFAULT_COMPONENTS_PATH) args.push(`--components-path ${JSON.stringify(plan.componentsPath)}`);
  if (plan.primary) args.push(`--primary ${JSON.stringify(plan.primary)}`);
  if (plan.packageManager) args.push(`--package-manager ${plan.packageManager}`);
  if (options.install === false) args.push("--no-install");
  if (plan.add.length) args.push(`--add ${plan.add.join(" ")}`);
  if (options.force) args.push("--force");
  return args.join(" ");
}

export async function initCommand(options: InitOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const automated = isAutomated(options);
  const plan = await planInit(options, cwd, automated);
  if (!plan) {
    console.log("Cancelled: prism.json was left as it was.");
    return;
  }
  const { framework, styling, componentsPath, primary, packageManager: pm } = plan;
  const theme = primary ? buildThemeCss({ light: { primary }, dark: { primary } }) : undefined;

  const config: PrismConfig = { framework, styling, componentsPath, components: [] };
  await fs.writeFile(path.join(cwd, "prism.json"), JSON.stringify(config, null, 2) + "\n");
  console.log(`✓ Prism initialized (${framework}, ${styling})`);

  // Dependencies
  const manual: string[] = [];
  if (pm) {
    if (installPackages(cwd, pm, framework)) console.log("✓ Installed runtime packages");
  } else {
    const reason = options.install === false ? "Install the runtime" : "No package.json found; install the runtime";
    manual.push(`${reason}:\n       npm install ${runtimePackages(framework).join(" ")}`);
  }

  // Tokens and theme
  const stylesheet = await findGlobalStylesheet(cwd);
  const themeDir = stylesheet ? path.dirname(stylesheet) : path.join(cwd, "src");
  const themePath = path.join(themeDir, "prism-theme.css");
  if (theme) {
    await fs.mkdir(themeDir, { recursive: true });
    await fs.writeFile(themePath, theme.css, "utf8");
    console.log(`✓ Wrote ${path.relative(cwd, themePath)}`);
    for (const i of theme.issues) {
      console.warn(`  ⚠ ${i.theme}: ${i.fg} on ${i.bg} is ${i.ratio.toFixed(2)}:1 (needs ${i.required}:1)`);
    }
  }

  if (stylesheet) {
    const css = await fs.readFile(stylesheet, "utf8");
    const updated = addStylesheetImports(css, styling, theme ? "./prism-theme.css" : undefined);
    if (updated !== css) {
      await fs.writeFile(stylesheet, updated, "utf8");
      console.log(`✓ Added Prism imports to ${path.relative(cwd, stylesheet)}`);
    }
  } else {
    const lines = addStylesheetImports("", styling, theme ? `./${path.relative(cwd, themePath).replace(/\\/g, "/")}` : undefined);
    manual.push(
      `No global stylesheet found; add to it${styling === "tailwind" ? ` (after @import "tailwindcss")` : ""}:\n       ${lines.trim().split("\n").join("\n       ")}`,
    );
  }

  // Starter components (`add` reads prism.json from the working directory)
  if (plan.add.length) {
    const previous = process.cwd();
    if (cwd !== previous) process.chdir(cwd);
    try {
      await addCommand(plan.add, {});
    } finally {
      if (cwd !== previous) process.chdir(previous);
    }
  }

  if (!theme) manual.push(`Use your brand color (optional):\n       npx @defied/prism-cli theme --primary "#0d9488"`);
  if (!plan.add.length) manual.push("Add components:\n       npx @defied/prism-cli add button");
  console.log(`\nNext steps:\n${manual.map((step, i) => `  ${i + 1}. ${step}`).join("\n")}`);

  if (!automated) {
    console.log(`\nSame setup without questions (CI, scripts):\n  ${automationCommand(plan, options)}`);
  }
}
