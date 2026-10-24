import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prompts = vi.hoisted(() => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
  checkbox: vi.fn(),
}));
vi.mock("@inquirer/prompts", () => prompts);

import { automationCommand, detectProject, initCommand, isAutomated, planInit } from "../src/commands/init";

let dir: string;
const readConfig = async () => JSON.parse(await fs.readFile(join(dir, "prism.json"), "utf8"));
const writePackageJson = (deps: Record<string, string>) =>
  fs.writeFile(join(dir, "package.json"), JSON.stringify({ dependencies: deps }));

/** Pretend a developer is at the terminal. */
function stubTerminal(tty: boolean) {
  vi.stubEnv("CI", "");
  for (const stream of [process.stdin, process.stdout]) {
    Object.defineProperty(stream, "isTTY", { value: tty, configurable: true });
  }
}

beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), "prism-init-flows-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  for (const prompt of Object.values(prompts)) prompt.mockReset();
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await fs.rm(dir, { recursive: true, force: true });
});

describe("choosing the flow", () => {
  it("automates with --yes, without a terminal, or in CI", () => {
    stubTerminal(true);
    expect(isAutomated({})).toBe(false);
    expect(isAutomated({ yes: true })).toBe(true);
    vi.stubEnv("CI", "true");
    expect(isAutomated({})).toBe(true);
    stubTerminal(false);
    expect(isAutomated({})).toBe(true);
  });
});

describe("detectProject", () => {
  it("reads the framework and Tailwind from package.json", async () => {
    expect(await detectProject(dir)).toEqual({ hasPackageJson: false, tailwind: false });
    await writePackageJson({ nuxt: "^4.0.0", tailwindcss: "^4.0.0" });
    expect(await detectProject(dir)).toMatchObject({ framework: "vue", tailwind: true });
    await writePackageJson({ next: "^16.0.0" });
    expect(await detectProject(dir)).toMatchObject({ framework: "react", tailwind: false });
  });
});

describe("automation flow", () => {
  it("never prompts and fills gaps from the project", async () => {
    await writePackageJson({ vue: "^3.5.0" });
    await initCommand({ cwd: dir, yes: true, install: false });
    expect(await readConfig()).toMatchObject({ framework: "vue", styling: "css-modules", componentsPath: "src/components/ui" });
    for (const prompt of Object.values(prompts)) expect(prompt).not.toHaveBeenCalled();
  });

  it("uses flags over detection", async () => {
    await writePackageJson({ vue: "^3.5.0" });
    await initCommand({ cwd: dir, yes: true, install: false, framework: "react", style: "css", componentsPath: "app/ui" });
    expect(await readConfig()).toMatchObject({ framework: "react", styling: "css", componentsPath: "app/ui" });
  });

  it("fails instead of asking to overwrite prism.json", async () => {
    await initCommand({ cwd: dir, yes: true, install: false });
    await expect(initCommand({ cwd: dir, yes: true, install: false })).rejects.toThrow(/--force/);
    await initCommand({ cwd: dir, yes: true, install: false, force: true, style: "css" });
    expect((await readConfig()).styling).toBe("css");
  });

  it("rejects unknown components before writing anything", async () => {
    await expect(initCommand({ cwd: dir, yes: true, install: false, add: ["button", "nope"] })).rejects.toThrow(
      /Unknown component: nope/,
    );
    await expect(fs.access(join(dir, "prism.json"))).rejects.toThrow();
  });

  it("adds the requested components", async () => {
    await initCommand({ cwd: dir, yes: true, install: false, add: ["badge"] });
    expect((await readConfig()).components).toEqual(["badge"]);
    await expect(fs.access(join(dir, "src/components/ui/Badge.tsx"))).resolves.toBeUndefined();
  });
});

describe("developer flow", () => {
  beforeEach(() => stubTerminal(true));

  it("asks only what the flags leave open, suggesting detected answers", async () => {
    await writePackageJson({ react: "^19.0.0", tailwindcss: "^4.0.0" });
    prompts.select.mockResolvedValueOnce("tailwind");
    prompts.input.mockResolvedValueOnce("src/ui").mockResolvedValueOnce("");
    prompts.checkbox.mockResolvedValueOnce([]);

    const plan = await planInit({ cwd: dir, framework: "react", install: false }, dir, false);

    // Framework came from the flag: only styling is a select
    expect(prompts.select).toHaveBeenCalledTimes(1);
    expect(prompts.select.mock.calls[0]![0]).toMatchObject({ message: "Styling", default: "tailwind" });
    expect(plan).toEqual({
      framework: "react",
      styling: "tailwind",
      componentsPath: "src/ui",
      primary: undefined,
      packageManager: undefined,
      add: [],
    });
  });

  it("offers every registry component to start with", async () => {
    prompts.select.mockResolvedValueOnce("vue").mockResolvedValueOnce("css");
    prompts.input.mockResolvedValueOnce("").mockResolvedValueOnce("");
    prompts.checkbox.mockResolvedValueOnce(["header"]);

    const plan = await planInit({ install: false }, dir, false);
    const names = prompts.checkbox.mock.calls[0]![0].choices.map((choice: { value: string }) => choice.value);
    expect(names).toContain("header");
    expect(names).toContain("button");
    expect(plan).toMatchObject({ framework: "vue", styling: "css", componentsPath: "src/components/ui", add: ["header"] });
  });

  it("asks before overwriting prism.json, and leaves it when declined", async () => {
    await fs.writeFile(join(dir, "prism.json"), `{"framework":"vue"}`);
    prompts.confirm.mockResolvedValueOnce(false);
    await initCommand({ cwd: dir, install: false, framework: "react", style: "css", componentsPath: "x", primary: "#0d9488", add: [] });
    expect(await fs.readFile(join(dir, "prism.json"), "utf8")).toBe(`{"framework":"vue"}`);
  });

  it("ends with the equivalent automation command", async () => {
    await initCommand({ cwd: dir, install: false, framework: "vue", style: "css", componentsPath: "src/ui", primary: "#0d9488", add: [] });
    const output = vi.mocked(console.log).mock.calls.flat().join("\n");
    expect(output).toContain(
      'npx @defied/prism-cli init --yes --framework vue --style css --components-path "src/ui" --primary "#0d9488" --no-install',
    );
    for (const prompt of Object.values(prompts)) expect(prompt).not.toHaveBeenCalled();
  });
});

describe("automationCommand", () => {
  it("omits defaults", () => {
    expect(
      automationCommand({ framework: "react", styling: "tailwind", componentsPath: "src/components/ui", add: [], packageManager: "pnpm" }),
    ).toBe("npx @defied/prism-cli init --yes --framework react --style tailwind --package-manager pnpm");
  });
});
