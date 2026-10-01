import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, { size, disabled, required, ...props }) =>
  h(
    m.Combobox,
    { defaultOpen: true, size, disabled, required },
    h(m.ComboboxInput, { "aria-label": "Framework", ...props }),
    h(
      m.ComboboxContent,
      {},
      h(m.ComboboxItem, { value: "react" }, "React"),
      h(
        m.ComboboxGroup,
        {},
        h(m.ComboboxLabel, {}, "Signals"),
        h(m.ComboboxItem, { value: "vue" }, "Vue"),
        h(m.ComboboxItem, { value: "solid", disabled: true }, "Solid"),
      ),
    ),
    h(m.ComboboxEmpty, {}, "No frameworks"),
  )) satisfies Fixture;
