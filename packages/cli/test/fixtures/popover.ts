import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Popover,
    { defaultOpen: true },
    h(m.PopoverTrigger, {}, "Share"),
    h(
      m.PopoverContent,
      { "aria-label": "Share options", ...props },
      h("p", {}, "Anyone with the link can view."),
      h(m.PopoverClose, {}, "Done"),
    ),
  )) satisfies Fixture;
