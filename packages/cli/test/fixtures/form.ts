import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Form, { "aria-label": "Sign up", ...props }, h("button", { type: "submit" }, "Send"))) satisfies Fixture;
