import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.IconButton, { "aria-label": "Add item", ...props }, () =>
    h("svg", { viewBox: "0 0 16 16" }, h("path", { d: "M8 2v12M2 8h12" })),
  )) satisfies VueFixture;
