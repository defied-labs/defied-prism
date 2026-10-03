import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Textarea, { "aria-label": "Message", ...props })) satisfies VueFixture;
