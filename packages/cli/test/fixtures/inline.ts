import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Inline, props, h("span", null, "One"), h("span", null, "Two"))) satisfies Fixture;
