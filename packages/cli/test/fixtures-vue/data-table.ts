import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

const columns = [
  { id: "name", header: "Name", accessor: (r: { name: string }) => r.name, sortable: true },
  { id: "age", header: "Age", accessor: (r: { age: number }) => r.age },
];
const data = [
  { name: "Ada", age: 36 },
  { name: "Linus", age: 28 },
];

export default ((m, props) =>
  h(m.DataTable, { "aria-label": "People", columns, data, selectable: true, ...props })) satisfies VueFixture;
