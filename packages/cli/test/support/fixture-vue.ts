import type { VNode } from "vue";

import type { GeneratedModule } from "./fixture";

/**
 * How the Vue contract harness renders a registry component; the Vue twin of
 * `Fixture`. Props arrive Vue-shaped (`class`, not `className`).
 */
export type VueFixture = (m: GeneratedModule, props: Record<string, unknown>) => VNode;
