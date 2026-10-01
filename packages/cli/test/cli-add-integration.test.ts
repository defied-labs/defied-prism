import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

describe("CLI Integration: prism init && prism add button", () => {
  let tempDir: string;
  let originalCwd: string;
  const cliPath = join(__dirname, "../dist/index.js");

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(join(tmpdir(), "prism-integration-"));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should initialize prism and add button component", async () => {
    // Run prism init
    const initResult = execSync(`node "${cliPath}" init`, {
      cwd: tempDir,
      encoding: "utf8",
    });
    expect(initResult).toContain("✓ Prism initialized");

    // Verify prism.json was created
    const prismConfig = await fs.readFile(join(tempDir, "prism.json"), "utf8");
    const config = JSON.parse(prismConfig);
    expect(config.framework).toBe("react");
    expect(config.styling).toBe("tailwind");
    expect(config.componentsPath).toBe("src/components/ui");
    expect(config.components).toEqual([]);

    // Run prism add button
    const addResult = execSync(`node "${cliPath}" add button`, {
      cwd: tempDir,
      encoding: "utf8",
    });
    expect(addResult).toContain("✓ Added button");

    // Verify button component was generated
    const buttonPath = join(tempDir, "src", "components", "ui", "Button.tsx");
    const buttonContent = await fs.readFile(buttonPath, "utf8");
    expect(buttonContent).toContain("export const Button");
    expect(buttonContent).toContain("useMachine");
    expect(buttonContent).toContain("buttonMachineDefinition");

    // Verify prism.json was updated with button component
    const updatedConfig = await fs.readFile(
      join(tempDir, "prism.json"),
      "utf8",
    );
    const updated = JSON.parse(updatedConfig);
    expect(updated.components).toContain("button");
  }, 30000);
});

describe("CLI Integration: registry dependencies", () => {
  let tempDir: string;
  const cliPath = join(__dirname, "../dist/index.js");
  const run = (args: string) => execSync(`node "${cliPath}" ${args}`, { cwd: tempDir, encoding: "utf8" });
  const config = async () => JSON.parse(await fs.readFile(join(tempDir, "prism.json"), "utf8"));
  const exists = (file: string) =>
    fs.access(join(tempDir, "src/components/ui", file)).then(() => true, () => false);

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), "prism-deps-"));
    run("init");
  });
  afterEach(() => fs.rm(tempDir, { recursive: true, force: true }));

  it("add installs dependencies first and records them", async () => {
    const out = run("add dialog");
    expect(out).toContain("✓ Added button (required by dialog)");
    expect(await exists("Button.tsx")).toBe(true);
    expect((await config()).components).toEqual(["button", "dialog"]);
  });

  it("add keeps a dependency that's already installed (it may be customized)", async () => {
    run("add button");
    await fs.appendFile(join(tempDir, "src/components/ui/Button.tsx"), "\n// customized\n");
    run("add dialog");
    expect(await fs.readFile(join(tempDir, "src/components/ui/Button.tsx"), "utf8")).toContain("// customized");
  });

  it("sync installs dependencies a component gained after it was installed", async () => {
    run("add toast");
    const cfg = await config();
    cfg.components = ["toast"]; // as installed before toast needed buttons
    await fs.writeFile(join(tempDir, "prism.json"), JSON.stringify(cfg));
    await fs.rm(join(tempDir, "src/components/ui/IconButton.tsx"));

    const out = run("sync");
    expect(out).toContain("✓ Added icon-button");
    expect(await exists("IconButton.tsx")).toBe(true);
    expect((await config()).components.sort()).toEqual(["button", "icon-button", "toast"]);
  });
});
