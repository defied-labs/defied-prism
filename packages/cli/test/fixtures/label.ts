import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

// The contract's `dimmed` variant is driven by the `disabled` prop
export default ((m, { dimmed, ...props }) => h(m.Label, { disabled: dimmed, ...props }, "Email")) satisfies Fixture;
