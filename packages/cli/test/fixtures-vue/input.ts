import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Input, { "aria-label": "Email", ...props })) satisfies VueFixture;
