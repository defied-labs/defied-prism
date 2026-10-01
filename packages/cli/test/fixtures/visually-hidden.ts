import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.VisuallyHidden, props, "Screen reader text")) satisfies Fixture;
