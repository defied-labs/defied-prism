import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Stack, props, h("div", null, "One"), h("div", null, "Two"))) satisfies Fixture;
