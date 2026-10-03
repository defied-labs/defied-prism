import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Card, props, () => [
    h(m.CardHeader, {}, () => [
      h(m.CardTitle, {}, () => h(m.CardLink, { href: "#report" }, () => "Quarterly report")),
      h(m.CardDescription, {}, () => "Updated today"),
    ]),
    h(m.CardContent, {}, () => "Revenue grew 12%."),
    h(m.CardFooter, {}, () => h("button", { type: "button" }, "Share")),
  ])) satisfies VueFixture;
