import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

const columns = [
  { id: "name", header: "Name", accessor: (r: { name: string }) => r.name, sortable: true },
  { id: "age", header: "Age", accessor: (r: { age: number }) => r.age },
];
const data = [
  { name: "Ada", age: 36 },
  { name: "Linus", age: 28 },
];

export default ((m, props) =>
  h(m.DataTable, { "aria-label": "People", columns, data, selectable: true, ...props })) satisfies Fixture;
