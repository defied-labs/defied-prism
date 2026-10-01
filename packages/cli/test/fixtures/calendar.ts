import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(m.Calendar, { "aria-label": "Due date", defaultValue: "2024-01-15", today: "2024-01-10", ...props })) satisfies Fixture;
