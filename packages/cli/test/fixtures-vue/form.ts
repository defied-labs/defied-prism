import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Form, { "aria-label": "Sign up", ...props }, () => h("button", { type: "submit" }, "Send"))) satisfies VueFixture;
