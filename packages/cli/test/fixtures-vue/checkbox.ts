import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Checkbox, props, () => "Accept the terms")) satisfies VueFixture;
