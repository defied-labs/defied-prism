import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

describe("CLI Integration: prism init && prism add button", () => {
  let tempDir: string;
  let originalCwd: string;
  const cliPath = join(__dirname, "../../../../packages/cli/dist/index.js");

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
