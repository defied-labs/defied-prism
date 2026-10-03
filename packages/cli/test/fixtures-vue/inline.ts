import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Inline, props, () => [h("span", "One"), h("span", "Two")])) satisfies VueFixture;
