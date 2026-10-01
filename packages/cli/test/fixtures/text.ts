import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Text, props, "The quick brown fox.")) satisfies Fixture;
