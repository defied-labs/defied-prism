import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Surface, props, () => "Panel content")) satisfies VueFixture;
