import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.RadioGroup, { "aria-label": "Plan", defaultValue: "pro", ...props }, () => [
    h(m.Radio, { value: "free" }, () => "Free"),
    h(m.Radio, { value: "pro" }, () => "Pro"),
    h(m.Radio, { value: "team", disabled: true }, () => "Team"),
  ])) satisfies VueFixture;
