import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.DropdownMenu, { defaultOpen: true }, () => [
    h(m.DropdownMenuTrigger, {}, () => "Options"),
    h(m.DropdownMenuContent, props, () => [
      h(m.DropdownMenuItem, {}, () => "New file"),
      h(m.DropdownMenuItem, { disabled: true }, () => "Delete"),
      h(m.DropdownMenuSeparator),
      h(m.DropdownMenuGroup, {}, () => [
        h(m.DropdownMenuLabel, {}, () => "View"),
        h(m.DropdownMenuCheckboxItem, { defaultChecked: true }, () => "Show hidden files"),
      ]),
      h(m.DropdownMenuRadioGroup, { defaultValue: "name" }, () => [
        h(m.DropdownMenuLabel, {}, () => "Sort by"),
        h(m.DropdownMenuRadioItem, { value: "name" }, () => "Name"),
        h(m.DropdownMenuRadioItem, { value: "date" }, () => "Date"),
      ]),
    ]),
  ])) satisfies VueFixture;
