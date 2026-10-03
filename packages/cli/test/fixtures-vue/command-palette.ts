import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.CommandPalette, { defaultOpen: true, ...props }, () => [
    h(m.CommandInput, {}),
    h(m.CommandList, {}, () => [
      h(m.CommandGroup, { heading: "File" }, () => [
        h(m.CommandItem, { value: "new" }, () => "New file"),
        h(m.CommandItem, { value: "open" }, () => "Open file"),
      ]),
      h(m.CommandSeparator, {}),
      h(m.CommandGroup, { heading: "View" }, () =>
        h(m.CommandItem, { value: "theme", disabled: true }, () => "Toggle theme"),
      ),
    ]),
    h(m.CommandEmpty, {}, () => "No results"),
  ])) satisfies VueFixture;
