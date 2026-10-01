import { createElement as h } from "react";
import { useFieldControlProps, type FieldControlProps } from "@defied-prism/react";
import type { Fixture } from "../support/fixture";

// A native input wired to the Field the way every Prism control is
function Control() {
  return h("input", useFieldControlProps<FieldControlProps & { type: string }>({ type: "email" }));
}

export default ((m, props) =>
  h(
    m.FieldGroup,
    { legend: "Account" },
    h(
      m.Field,
      props,
      h(m.FieldLabel, { required: true }, "Email"),
      h(Control),
      h(m.FieldDescription, null, "We never share it."),
      h(m.FieldError, null),
    ),
  )) satisfies Fixture;
