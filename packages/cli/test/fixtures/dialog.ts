import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Dialog,
    { defaultOpen: true },
    h(m.DialogTrigger, {}, "Edit profile"),
    h(
      m.DialogContent,
      props,
      h(m.DialogTitle, {}, "Edit profile"),
      h(m.DialogDescription, {}, "Changes are saved when you close this dialog."),
      h(m.DialogFooter, {}, h(m.DialogClose, {}, "Cancel")),
    ),
  )) satisfies Fixture;
