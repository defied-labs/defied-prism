import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) => h(m.Link, { href: "/docs", ...props }, () => "Documentation")) satisfies VueFixture;
