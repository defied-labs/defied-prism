import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.EmptyState,
    props,
    h(m.EmptyStateTitle, {}, "No projects yet"),
    h(m.EmptyStateDescription, {}, "Create a project to get started."),
  )) satisfies Fixture;
