import { describe, expect, it } from "vitest";

import { resolveInstallOrder } from "../src/commands/add";
import { registryPath } from "./support/generated";

describe("resolveInstallOrder", () => {
  it("puts registry dependencies first, once", async () => {
    expect(await resolveInstallOrder("button", registryPath)).toEqual(["button"]);
    expect(await resolveInstallOrder("toast", registryPath)).toEqual(["button", "icon-button", "toast"]);
  });
});
