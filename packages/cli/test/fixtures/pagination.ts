import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Pagination, { count: 10, defaultPage: 5, ...props })) satisfies Fixture;
