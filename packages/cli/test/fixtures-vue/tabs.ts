import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, { class: className, ...props }) =>
  h(m.Tabs, { defaultValue: "account", ...props }, () => [
    h(m.TabList, { "aria-label": "Settings", class: className }, () => [
      h(m.Tab, { value: "account" }, () => "Account"),
      h(m.Tab, { value: "billing" }, () => "Billing"),
    ]),
    h(m.TabPanel, { value: "account" }, () => "Account settings"),
    h(m.TabPanel, { value: "billing" }, () => "Billing settings"),
  ])) satisfies VueFixture;
