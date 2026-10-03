import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Alert, props, () =>
    h(m.AlertContent, {}, () => [
      h(m.AlertTitle, {}, () => "Payment failed"),
      h(m.AlertDescription, {}, () => "Your card was declined."),
    ]),
  )) satisfies VueFixture;
