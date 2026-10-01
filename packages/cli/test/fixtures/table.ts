import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Table,
    props,
    h(m.TableCaption, {}, "Invoices"),
    h(m.TableHeader, {}, h(m.TableRow, {}, h(m.TableHead, {}, "Invoice"), h(m.TableHead, {}, "Amount"))),
    h(
      m.TableBody,
      {},
      h(m.TableRow, {}, h(m.TableHead, { scope: "row" }, "INV-1"), h(m.TableCell, {}, "$10")),
      h(m.TableRow, {}, h(m.TableHead, { scope: "row" }, "INV-2"), h(m.TableCell, {}, "$20")),
    ),
    h(m.TableFooter, {}, h(m.TableRow, {}, h(m.TableHead, { scope: "row" }, "Total"), h(m.TableCell, {}, "$30"))),
  )) satisfies Fixture;
