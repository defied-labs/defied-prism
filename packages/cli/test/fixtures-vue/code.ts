import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Code, props, () => "npm install")) satisfies VueFixture;
