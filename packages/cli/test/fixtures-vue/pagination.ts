import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Pagination, { count: 10, defaultPage: 5, ...props })) satisfies VueFixture;
