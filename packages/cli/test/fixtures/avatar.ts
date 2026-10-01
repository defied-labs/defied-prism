import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Avatar, { alt: "Ada Lovelace", ...props })) satisfies Fixture;
