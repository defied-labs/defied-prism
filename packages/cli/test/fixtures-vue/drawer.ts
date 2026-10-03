import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Drawer, { defaultOpen: true }, () => [
    h(m.DrawerTrigger, {}, () => "Edit profile"),
    h(m.DrawerContent, props, () => [
      h(m.DrawerTitle, {}, () => "Edit profile"),
      h(m.DrawerDescription, {}, () => "Changes are saved when you close this drawer."),
      h(m.DrawerFooter, {}, () => h(m.DrawerClose, {}, () => "Cancel")),
    ]),
  ])) satisfies VueFixture;
