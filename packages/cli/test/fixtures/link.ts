import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Link, { href: "/docs", ...props }, "Documentation")) satisfies Fixture;
