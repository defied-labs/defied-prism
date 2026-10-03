import { defineComponent, h } from "vue";
import { useFieldControlProps, type FieldControlProps } from "@defied/prism-vue";
import type { VueFixture } from "../support/fixture-vue";

// A native input wired to the Field the way every Prism control is
const Control = defineComponent(() => {
  const props = useFieldControlProps<FieldControlProps & { type: string }>({ type: "email" });
  return () => h("input", props.value);
});

export default ((m, props) =>
  h(m.FieldGroup, { legend: "Account" }, () =>
    h(m.Field, props, () => [
      h(m.FieldLabel, { required: true }, () => "Email"),
      h(Control),
      h(m.FieldDescription, null, () => "We never share it."),
      h(m.FieldError, null),
    ]),
  )) satisfies VueFixture;
