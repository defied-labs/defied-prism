import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Stack, props, () => [h("div", "One"), h("div", "Two")])) satisfies VueFixture;
