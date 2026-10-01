import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Slider, { "aria-label": "Volume", defaultValue: 40, ...props })) satisfies Fixture;
