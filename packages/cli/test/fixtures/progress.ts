import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(m.Progress, { "aria-label": "Upload", value: 40, ...props })) satisfies Fixture;
