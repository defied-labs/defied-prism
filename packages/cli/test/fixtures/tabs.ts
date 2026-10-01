import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, { className, ...props }) =>
  h(
    m.Tabs,
    { defaultValue: "account", ...props },
    h(
      m.TabList,
      { "aria-label": "Settings", className },
      h(m.Tab, { value: "account" }, "Account"),
      h(m.Tab, { value: "billing" }, "Billing"),
    ),
    h(m.TabPanel, { value: "account" }, "Account settings"),
    h(m.TabPanel, { value: "billing" }, "Billing settings"),
  )) satisfies Fixture;
