import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Heading, props, "Account settings")) satisfies Fixture;
