import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Badge, props, "Paid")) satisfies Fixture;
