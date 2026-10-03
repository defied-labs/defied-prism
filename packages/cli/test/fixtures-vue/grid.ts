import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Grid, props, () => [h("div", null, "One"), h("div", null, "Two")])) satisfies VueFixture;
