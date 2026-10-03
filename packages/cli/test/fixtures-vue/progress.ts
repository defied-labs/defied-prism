import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Progress, { "aria-label": "Upload", value: 40, ...props })) satisfies VueFixture;
