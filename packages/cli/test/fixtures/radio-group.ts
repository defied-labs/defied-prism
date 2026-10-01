import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.RadioGroup,
    { "aria-label": "Plan", defaultValue: "pro", ...props },
    h(m.Radio, { value: "free" }, "Free"),
    h(m.Radio, { value: "pro" }, "Pro"),
    h(m.Radio, { value: "team", disabled: true }, "Team"),
  )) satisfies Fixture;
