// @vitest-environment jsdom
/** The component contract (see support/contract-suite.ts), for Vue. */
import { rmSync } from "node:fs";
import path from "node:path";
import type { VNode } from "vue";
import { cleanup, render } from "@testing-library/vue";
import { afterAll, afterEach } from "vitest";

import { defineContractSuite } from "./support/contract-suite";
import { componentsFor, generatedRoot, loadGenerated } from "./support/generated";
import type { VueFixture } from "./support/fixture-vue";

const FIXTURES: Record<string, VueFixture> = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: VueFixture }>("./fixtures-vue/*.ts", { eager: true }),
  ).map(([file, mod]) => [path.basename(file, ".ts"), mod.default]),
);

/** The suite speaks React prop names; Vue spells the class attribute `class`. */
const vueProps = ({ className, ...props }: Record<string, unknown>) =>
  className === undefined ? props : { ...props, class: className };

// Per filter, so filtered runs in parallel never delete each other's output
const NAMESPACE = `contract-vue-${process.env.PRISM_COMPONENTS ?? "all"}`.replace(/[^a-z0-9-]/gi, "_");
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

defineContractSuite<VNode>({
  framework: "vue",
  components: componentsFor("vue"),
  fixtures: Object.fromEntries(
    Object.entries(FIXTURES).map(([name, fixture]) => [name, (m, props) => fixture(m, vueProps(props))]),
  ),
  load: (name, styling) => loadGenerated(name, styling, NAMESPACE, "vue"),
  render: (node) => render({ render: () => node }),
  cleanup,
});
