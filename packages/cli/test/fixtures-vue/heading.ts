import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Heading, props, () => "Account settings")) satisfies VueFixture;
