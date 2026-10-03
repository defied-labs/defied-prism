import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Avatar, { alt: "Ada Lovelace", ...props })) satisfies VueFixture;
