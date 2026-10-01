import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, { size, disabled, required, ...props }) =>
  h(
    m.Select,
    { defaultOpen: true, defaultValue: "apple", size, disabled, required },
    h(m.SelectTrigger, { "aria-label": "Fruit", ...props }),
    h(
      m.SelectContent,
      {},
      h(m.SelectItem, { value: "none" }, "None"),
      h(m.SelectSeparator),
      h(
        m.SelectGroup,
        {},
        h(m.SelectLabel, {}, "Fruits"),
        h(m.SelectItem, { value: "apple" }, "Apple"),
        h(m.SelectItem, { value: "banana", disabled: true }, "Banana"),
      ),
    ),
  )) satisfies Fixture;
