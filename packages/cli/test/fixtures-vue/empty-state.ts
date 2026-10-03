import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.EmptyState, props, () => [
    h(m.EmptyStateTitle, {}, () => "No projects yet"),
    h(m.EmptyStateDescription, {}, () => "Create a project to get started."),
  ])) satisfies VueFixture;
