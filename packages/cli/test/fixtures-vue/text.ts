import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Text, props, () => "The quick brown fox.")) satisfies VueFixture;
