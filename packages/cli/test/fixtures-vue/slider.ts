import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Slider, { "aria-label": "Volume", defaultValue: 40, ...props })) satisfies VueFixture;
