import type { VNodeChild } from "vue";
import type { RowKey, SortState } from "@defied-prism/core/components/data-table";

export type { RowKey, SortState };

export interface DataTableColumn<Row> {
  /** Unique column id; also the sort key. */
  id: string;
  header: VNodeChild;
  /** Cell value; used for sorting and, without `cell`, for display. */
  accessor: (row: Row) => unknown;
  /** Custom cell content. A `#cell-<id>="{ row, value }"` slot works too. */
  cell?: (row: Row, value: unknown) => VNodeChild;
  sortable?: boolean;
  /** Ascending comparator on accessor values. */
  compare?: (a: unknown, b: unknown) => number;
  /** Render this column's cells as row headers (<th scope="row">). */
  rowHeader?: boolean;
}
