import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Alert,
    props,
    h(
      m.AlertContent,
      {},
      h(m.AlertTitle, {}, "Payment failed"),
      h(m.AlertDescription, {}, "Your card was declined."),
    ),
  )) satisfies Fixture;
