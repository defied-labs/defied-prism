import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Checkbox, props, "Accept the terms")) satisfies Fixture;
