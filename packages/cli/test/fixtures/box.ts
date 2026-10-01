import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Box, props, "Content")) satisfies Fixture;
