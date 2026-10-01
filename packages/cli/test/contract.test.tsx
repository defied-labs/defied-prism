// @vitest-environment jsdom
/** The component contract (see support/contract-suite.ts), for React. */
import { rmSync } from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach } from "vitest";

import { defineContractSuite } from "./support/contract-suite";
import { generatedRoot, loadGenerated, selectedComponents } from "./support/generated";
import type { Fixture } from "./support/fixture";

const FIXTURES: Record<string, Fixture> = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: Fixture }>("./fixtures/*.ts", { eager: true }),
  ).map(([file, mod]) => [path.basename(file, ".ts"), mod.default]),
);

// Per filter, so filtered runs in parallel never delete each other's output
const NAMESPACE = `contract-${process.env.PRISM_COMPONENTS ?? "all"}`.replace(/[^a-z0-9-]/gi, "_");
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

defineContractSuite<ReactElement>({
  framework: "react",
  components: selectedComponents,
  fixtures: FIXTURES,
  load: (name, styling) => loadGenerated(name, styling, NAMESPACE),
  render,
  cleanup,
});
