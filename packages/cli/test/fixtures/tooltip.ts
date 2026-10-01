import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Tooltip,
    { defaultOpen: true },
    h(m.TooltipTrigger, {}, "Save"),
    h(m.TooltipContent, props, "Saves your changes"),
  )) satisfies Fixture;
